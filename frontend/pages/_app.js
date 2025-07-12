import '../styles/globals.css'
import { ToastProvider } from '../context/ToastContext'

export default function App({ Component, pageProps }) {
  return (
    <ToastProvider>
      <Component {...pageProps} />
    </ToastProvider>
  )
}