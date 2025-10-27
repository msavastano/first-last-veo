import React from 'react';
import { View } from '../types';

interface HomeProps {
  setActiveView: (view: View) => void;
}

const colorMap = {
    cyan: {
        ring: 'bg-cyan-500/20',
        iconBg: 'bg-cyan-500',
        border: 'border-cyan-500',
        button: 'bg-cyan-600 hover:bg-cyan-700',
    },
    purple: {
        ring: 'bg-purple-500/20',
        iconBg: 'bg-purple-500',
        border: 'border-purple-500',
        button: 'bg-purple-600 hover:bg-purple-700',
    },
    teal: {
        ring: 'bg-teal-500/20',
        iconBg: 'bg-teal-500',
        border: 'border-teal-500',
        button: 'bg-teal-600 hover:bg-teal-700',
    },
    orange: {
        ring: 'bg-orange-500/20',
        iconBg: 'bg-orange-500',
        border: 'border-orange-500',
        button: 'bg-orange-600 hover:bg-orange-700',
    }
};

type WorkflowColor = keyof typeof colorMap;

const WorkflowStep: React.FC<{
  step: number;
  title: string;
  description: string;
  buttonText: string;
  icon: React.ReactElement;
  onNavigate: () => void;
  color: WorkflowColor;
}> = ({ step, title, description, buttonText, icon, onNavigate, color }) => {
    const colors = colorMap[color];
    return (
        <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
                <div className={`w-16 h-16 rounded-full ${colors.ring} flex items-center justify-center`}>
                    <div className={`w-12 h-12 rounded-full ${colors.iconBg} text-white flex items-center justify-center shadow-lg`}>
                        {icon}
                    </div>
                </div>
                <div className={`absolute top-0 -right-2 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-2 ${colors.border} flex items-center justify-center text-xs font-bold`}>
                    {step}
                </div>
            </div>
            <div className="pt-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1 mb-3">{description}</p>
                <button
                    onClick={onNavigate}
                    className={`${colors.button} text-white font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105`}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    )
};

const Connector: React.FC = () => (
    <div className="h-16 w-px bg-gray-300 dark:bg-gray-600 border border-dashed border-gray-400 dark:border-gray-500 ml-8 my-2"></div>
);

const Home: React.FC<HomeProps> = ({ setActiveView }) => {
    const detailedWorkflowSteps: {
        step: number;
        title: string;
        description: string;
        buttonText: string;
        icon: React.ReactElement;
        action: () => void;
        color: WorkflowColor;
    }[] = [
        {
            step: 1,
            title: 'Enhance Image Prompt',
            description: 'Craft the perfect prompt for your video\'s starting frame.',
            buttonText: 'Go to Prompt Enhancer',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
            action: () => setActiveView('prompt-enhancer'),
            color: 'cyan',
        },
        {
            step: 2,
            title: 'Generate First Frame',
            description: 'Use your new prompt to generate the starting image for your video.',
            buttonText: 'Go to Image Generator',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
            action: () => setActiveView('image-gen'),
            color: 'purple',
        },
        {
            step: 3,
            title: 'Enhance Edit Prompt',
            description: 'Now, create a prompt to describe the changes for your final frame.',
            buttonText: 'Go to Prompt Enhancer',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
            action: () => setActiveView('prompt-enhancer'),
            color: 'cyan',
        },
        {
            step: 4,
            title: 'Create Final Frame',
            description: 'Use the Image Editor with your starting image and edit prompt to create the final frame.',
            buttonText: 'Go to Image Editor',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
            action: () => setActiveView('image-edit'),
            color: 'teal',
        },
        {
            step: 5,
            title: 'Enhance Video Prompt',
            description: 'Finally, create a prompt to describe the action between your two frames.',
            buttonText: 'Go to Prompt Enhancer',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
            action: () => setActiveView('prompt-enhancer'),
            color: 'cyan',
        },
        {
            step: 6,
            title: 'Produce Your Video',
            description: 'Upload your frames, add the video prompt, and generate your masterpiece.',
            buttonText: 'Go to Video Generator',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
            action: () => setActiveView('video-gen'),
            color: 'orange',
        },
    ];

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-4xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Creative Workflow</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-10">Follow this path to create a complete video from scratch, or jump in at any step.</p>
            
            <div className="flex flex-col">
                {detailedWorkflowSteps.map((step, index) => (
                    <React.Fragment key={step.step + step.title}>
                        <WorkflowStep 
                            step={step.step}
                            title={step.title}
                            description={step.description}
                            buttonText={step.buttonText}
                            icon={step.icon}
                            onNavigate={step.action}
                            color={step.color}
                        />
                        {index < detailedWorkflowSteps.length - 1 && <Connector />}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Home;