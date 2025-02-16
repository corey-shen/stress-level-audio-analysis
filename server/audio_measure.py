import numpy as np
import torch
import torch.nn as nn
from transformers import Wav2Vec2Processor
from transformers.models.wav2vec2.modeling_wav2vec2 import (
    Wav2Vec2Model,
    Wav2Vec2PreTrainedModel,
)
import soundfile as sf
import argparse
import librosa
from tqdm import tqdm


class RegressionHead(nn.Module):
    r"""Classification head."""

    def __init__(self, config):

        super().__init__()

        self.dense = nn.Linear(config.hidden_size, config.hidden_size)
        self.dropout = nn.Dropout(config.final_dropout)
        self.out_proj = nn.Linear(config.hidden_size, config.num_labels)

    def forward(self, features, **kwargs):

        x = features
        x = self.dropout(x)
        x = self.dense(x)
        x = torch.tanh(x)
        x = self.dropout(x)
        x = self.out_proj(x)

        return x


class EmotionModel(Wav2Vec2PreTrainedModel):
    r"""Speech emotion classifier."""

    def __init__(self, config):

        super().__init__(config)

        self.config = config
        self.wav2vec2 = Wav2Vec2Model(config)
        self.classifier = RegressionHead(config)
        self.init_weights()

    def forward(
            self,
            input_values,
    ):

        outputs = self.wav2vec2(input_values)
        hidden_states = outputs[0]
        hidden_states = torch.mean(hidden_states, dim=1)
        logits = self.classifier(hidden_states)

        return hidden_states, logits

# load model from hub
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
if torch.cuda.is_available():
    print(f"Using GPU: {torch.cuda.get_device_name()}")
else:
    print("Using CPU")
model_name = 'audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim'
processor = Wav2Vec2Processor.from_pretrained(model_name)
model = EmotionModel.from_pretrained(model_name).to(device)

def process_func(
    x: np.ndarray,
    sampling_rate: int,
    embeddings: bool = False,
) -> np.ndarray:
    r"""Predict emotions or extract embeddings from raw audio signal."""

    # run through processor to normalize signal
    # always returns a batch, so we just get the first entry
    # then we put it on the device
    y = processor(x, sampling_rate=sampling_rate)
    y = y['input_values'][0]
    y = y.reshape(1, -1)
    y = torch.from_numpy(y).to(device)

    # run through model
    with torch.no_grad():
        y = model(y)[0 if embeddings else 1]

    # convert to numpy
    y = y.detach().cpu().numpy()

    return y

def process_audio(audio, num_chunks, sampling_rate):
    """Process audio by splitting into equal chunks
    
    Args:
        audio (numpy.ndarray): Input audio data
        num_chunks (int): Number of equal-sized chunks to split audio into
        sampling_rate (int): Sampling rate of audio 
        
    Returns:
        list: List of audio chunks
    """
    # Calculate samples per chunk based on total length
    chunk_samples = len(audio) // num_chunks
    chunks = []
    
    print("Chunking audio...")
    for i in tqdm(range(num_chunks)):
        start = i * chunk_samples
        end = start + chunk_samples
        chunk = audio[start:end]
        chunks.append(chunk)
    
    return chunks

def process_file(audio_path, num_chunks, alpha, beta, gamma):
    """Process an audio file and return array of stress values
    
    Args:
        audio_path (str): Path to audio file
        num_chunks (int): Number of equal-sized chunks to split audio into
        alpha (float): Weight for arousal in stress calculation
        beta (float): Weight for valence in stress calculation
        gamma (float): Emphasis factor for stress calculation
        
    Returns:
        dict: Dictionary containing arrays of emotion values
    """
    print("Loading audio file...")
    # Load audio file using soundfile with tqdm
    with sf.SoundFile(audio_path) as f:
        frames = len(f)
        channels = f.channels
        with tqdm(total=frames, desc="Reading audio") as pbar:
            audio = np.zeros(frames, dtype=np.float32)  # Pre-allocate array for one channel
            pos = 0
            block_size = 10000
            while pos < frames:
                chunk = f.read(block_size)
                if not len(chunk):
                    break
                # If stereo, take the first channel
                if channels > 1:
                    chunk = chunk[:, 0]
                audio[pos:pos + len(chunk)] = chunk  # Direct assignment to array
                pos += len(chunk)
                pbar.update(len(chunk))
    
    sr = f.samplerate
    print(f"Original sample rate: {sr}")
    if sr != 16000:
        print("Resampling audio to 16kHz...")
        audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)
        sr = 16000
    print(f"New sample rate: {sr}")
    
    chunks = process_audio(audio, num_chunks, sr)

    arousal_values = []
    dominance_values = []
    valence_values = []
    stress_values = []
    three_d_values = []
    
    print("Processing chunks...")
    for chunk in tqdm(chunks):
        results = process_func(chunk.reshape(1, -1), sr)[0]
        results = np.clip(results, 0, 1)   # clip
        stress = (alpha * results[0] + beta * (1 - results[2])) / (alpha + beta)
        # Apply gamma
        stress = stress ** gamma
        # Get the data values
        arousal = round(float(results[0]), 4)
        dominance = round(float(results[1]), 4)
        valence = round(float(results[2]), 4)
        stress = round(float(stress), 4)

        arousal_values.append(arousal)
        dominance_values.append(dominance)
        valence_values.append(valence)
        stress_values.append(stress)
        three_d_values.append((dominance, valence, arousal))
    
    dictionary = {}

    dictionary["arousal"] = arousal_values
    dictionary["dominance"] = dominance_values
    dictionary["valence"] = valence_values
    dictionary["stress"] = stress_values
    dictionary["three_d"] = three_d_values

    return dictionary

def main():
    parser = argparse.ArgumentParser(description='Process audio file for stress analysis')
    parser.add_argument('--audio_path', type=str, required=True, help='Path to audio file')
    parser.add_argument('--chunks', type=int, default=10, help='Number of equal-sized chunks to split audio into')
    parser.add_argument('--alpha', type=float, default=10, help='Weight for arousal in stress calculation')
    parser.add_argument('--beta', type=float, default=1, help='Weight for valence in stress calculation')
    parser.add_argument('--gamma', type=float, default=2, help='Emphasis factor for stress calculation')
    
    args = parser.parse_args()
    
    # Process file and get stress values
    stress_values = process_file(args.audio_path, args.chunks, args.alpha, args.beta, args.gamma)
    print(stress_values)
    return stress_values

if __name__ == "__main__":
    main()

#print(process_func(signal, sampling_rate))
#  Arousal    dominance valence
# [[0.5460754  0.6062266  0.40431657]]


# print(process_func(signal, sampling_rate, embeddings=True))
# Pooled hidden states of last transformer layer
# [[-0.00752167  0.0065819  -0.00746342 ...  0.00663632  0.00848748
#    0.00599211]]


