## Inspiration
In a world where stress and anxiety are increasingly prevalent, we were inspired to create a tool that not only helps individuals understand their emotional states, but also empowers them to take control of their mental well-being. Mood and Metrics was born out of a desire to bridge the gap between technology and emotional health, offering a way for people to easily visualize and comprehend their emotional levels through AI-driven insights.

## What it does 
Mood and Metrics offers three analysis modalities:
- Audio Analysis: Utilizes a locally deployed audio sentiment analysis model to capture arousal, valence, and dominance values to map them onto a stress score scale
- Video Analysis: Sends a video clip to Gemini, and evaluates calm/stress levels and in-depth text reasoning analysis through facial expression data
- Transcription Analysis: Performs sentiment analysis on video transcription data, evaluating calm/stress levels and in-depth text reasoning analysis
- For all modalities, data is visualized in 2D or 3D

## How we built it
- Utilized a state-of-the-art fine-tuned wav2vec2 transformer architecture (https://arxiv.org/abs/2203.07378) for audio sentiment analysis via Hugging Face and Pytorch
- Leveraged three.js to create an interactable 3D graph to map valence, dominance, and arousal
- Mapped emotion using a theoretical approach based on a tri-dimensional
model of core affect and emotion concepts (https://www.redalyc.org/pdf/3111/311126297005.pdf)
- Integrated Google’s Gemini AI API for video-based and transcription-based mood analysis.
- Developed a React frontend with an interactive UI

## Challenges we ran into
- Locally installing transformer model via Hugging Face and Pytorch, and allowing GPU cuda acceleration
- Extrapolating accurate stress score from arousal, valence, and dominance values
- Getting the axis and rotation from the camera perspective to match for 3D visualizations
- Constructing a pipeline to send video footage to Gemini via an API call
- Creating a clean frontend to visualize graphs using data from the backend server

## Accomplishments that we're proud of
- Successfully integrating AI-driven audio, video, and transcription sentiment analysis
- Creating an engaging and informational visualization of emotional/mood states
- Achieving reliable stress detection for educational, healthcare, and meditational use

## What we learned 
- The nuances of valence, dominance, and arousal in audio sentiment analysis
- Balancing technicality and simplicity in data visualization

## What's next for Moods and Weights
- Enhancing AI models with more modalities such as heartbeat, EKG signals, etc.
- Collecting accurate breathing audio to stress score data and training the model from scratch
- Adding real-time video analysis without needing pre-recorded clips
- Expanding features with personalized stress relief suggestions
- Deploying a mobile version for on-the-go, fully local emotional tracking