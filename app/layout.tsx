import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'AI Interviewer Dashboard',
  description: 'Manage and review your AI mock interviews securely.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
