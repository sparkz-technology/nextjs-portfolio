import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

interface FilePreviewProps {
  file: File | null
  preview: string
}

export function FilePreview({ file, preview }: FilePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  if (!file) return null

  const isVideo = file.type.startsWith('video/')

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0]
    setVolume(volumeValue)
    setIsMuted(volumeValue === 0)
    if (videoRef.current) {
      videoRef.current.volume = volumeValue
      videoRef.current.muted = volumeValue === 0
    }
  }

  return (
    <motion.div
      className="mt-4 relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isVideo ? (
        <div className="relative">
          <video
            ref={videoRef}
            src={preview}
            className="w-full max-h-[200px] object-contain rounded-md"
            onClick={togglePlay}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: isPlaying ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 text-white" />
            ) : (
              <Play className="w-12 h-12 text-white" />
            )}
          </motion.div>
          <motion.div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-2 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: showControls ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:text-primary transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <div className="w-24 mx-2">
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Image
            src={preview}
            alt="File preview"
            width={400}
            height={300}
            className="w-full max-h-[200px] object-contain rounded-md"
          />
        </motion.div>
      )}
    </motion.div>
  )
}

