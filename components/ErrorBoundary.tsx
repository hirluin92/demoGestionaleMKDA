'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught error:', error)
      console.error('Component stack:', errorInfo.componentStack)
    }
    
    // In production, send to error tracking service (Sentry, etc)
    // TODO: Add error tracking service integration
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
          <div className="max-w-md w-full bg-dark-50/80 backdrop-blur-xl border border-gold-400/20 rounded-2xl shadow-dark-lg p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-accent-danger/10 p-2 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-accent-danger" />
              </div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                Si è verificato un errore
              </h2>
            </div>
            
            <p className="text-dark-600 mb-6">
              Qualcosa è andato storto. Prova a ricaricare la pagina o torna alla home.
            </p>

            {/* Show error details in development only */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-dark-100/50 rounded-xl border border-dark-200/30">
                <summary className="cursor-pointer text-sm font-bold text-dark-700 mb-2 hover:text-gold-400 transition-colors">
                  Dettagli tecnici (solo in sviluppo)
                </summary>
                <div className="space-y-2 mt-2">
                  <div>
                    <p className="text-xs font-semibold text-dark-600 mb-1">Errore:</p>
                    <pre className="text-xs text-accent-danger overflow-auto p-2 bg-dark-950 rounded-lg">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <p className="text-xs font-semibold text-dark-600 mb-1">Stack trace:</p>
                      <pre className="text-xs text-dark-500 overflow-auto p-2 bg-dark-950 rounded-lg max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div>
                      <p className="text-xs font-semibold text-dark-600 mb-1">Component stack:</p>
                      <pre className="text-xs text-dark-500 overflow-auto p-2 bg-dark-950 rounded-lg max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-3 bg-dark-100 hover:bg-dark-200 text-white rounded-xl font-semibold transition-colors"
              >
                Riprova
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-dark-950 rounded-xl font-bold shadow-gold transition-all"
              >
                Vai alla Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}
