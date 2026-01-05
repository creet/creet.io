import React from 'react';
import Link from 'next/link';

export default function PublicFormNotFound() {
    return (
        <div className="w-full h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700/50">
                        <svg
                            className="w-10 h-10 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-white mb-3">
                    Form Not Found
                </h1>

                {/* Description */}
                <p className="text-gray-400 mb-8 leading-relaxed">
                    This form doesn't exist or may have been removed.
                    Please check the link and try again.
                </p>

                {/* Action */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Go Home
                </Link>
            </div>

            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
        </div>
    );
}
