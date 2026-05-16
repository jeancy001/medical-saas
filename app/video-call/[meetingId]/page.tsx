'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  Monitor,
  MessageSquare,
  Users,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BookingData {
  _id: string
  patientInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  scheduledDate: string
  scheduledTime: string
  reason: string
  status: string
  hospitalId: {
    name: string
    logo?: string
  }
  doctorId?: {
    firstName: string
    lastName: string
    specialization: string
  }
}

export default function VideoCallPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.meetingId as string

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [callStatus, setCallStatus] = useState<'loading' | 'waiting' | 'connecting' | 'connected' | 'ended'>('loading')
  
  // Video call state
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/video-booking/${meetingId}`)
        const data = await response.json()
        if (data.success) {
          setBooking(data.data)
          setCallStatus('waiting')
        } else {
          setError('Meeting not found')
        }
      } catch (err) {
        setError('Failed to load meeting details')
      } finally {
        setLoading(false)
      }
    }

    if (meetingId) {
      fetchBooking()
    }
  }, [meetingId])

  // Initialize local media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Error accessing media devices:', err)
      setError('Could not access camera or microphone. Please check permissions.')
    }
  }, [])

  // Initialize WebRTC connection (simplified for demo)
  const initializePeerConnection = useCallback(() => {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }

    const pc = new RTCPeerConnection(config)
    peerConnectionRef.current = pc

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected') {
        setCallStatus('connected')
        startCallTimer()
      } else if (pc.iceConnectionState === 'disconnected') {
        setCallStatus('ended')
      }
    }

    return pc
  }, [])

  // Start call timer
  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
  }

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Join the call
  const joinCall = async () => {
    setCallStatus('connecting')
    await initializeMedia()
    initializePeerConnection()
    
    // Update booking status
    try {
      await fetch(`/api/video-booking/${meetingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join_waiting' })
      })
    } catch (err) {
      console.error('Error updating status:', err)
    }

    // Simulate connection for demo (in production, use signaling server)
    setTimeout(() => {
      setCallStatus('connected')
      startCallTimer()
    }, 2000)
  }

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsVideoOn(!isVideoOn)
    }
  }

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        })
        
        const videoTrack = screenStream.getVideoTracks()[0]
        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video')
        
        if (sender) {
          sender.replaceTrack(videoTrack)
        }
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }
        
        videoTrack.onended = () => {
          stopScreenShare()
        }
        
        setIsScreenSharing(true)
      } catch (err) {
        console.error('Error sharing screen:', err)
      }
    } else {
      stopScreenShare()
    }
  }

  const stopScreenShare = () => {
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current
      
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video')
      
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack)
      }
    }
    setIsScreenSharing(false)
  }

  // End call
  const endCall = async () => {
    // Stop timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
    }

    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }

    // Update booking status
    try {
      await fetch(`/api/video-booking/${meetingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end_call' })
      })
    } catch (err) {
      console.error('Error ending call:', err)
    }

    setCallStatus('ended')
  }

  // Send chat message
  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        sender: 'You',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
      setNewMessage('')
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="mt-4 text-lg font-semibold">Meeting Not Found</h2>
            <p className="mt-2 text-muted-foreground">{error || 'This meeting link is invalid or has expired.'}</p>
            <Button className="mt-6" onClick={() => router.push('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Waiting room
  if (callStatus === 'waiting' || callStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Video Consultation</CardTitle>
            <p className="text-muted-foreground">{booking.hospitalId?.name || 'MediCare Pro'}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium">{booking.patientInfo.firstName} {booking.patientInfo.lastName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="font-medium">
                  {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reason</span>
                <span className="font-medium truncate max-w-[200px]">{booking.reason}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                  {booking.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Click the button below to join the waiting room. The doctor will admit you shortly.
              </p>
              <Button className="w-full" size="lg" onClick={joinCall}>
                <Video className="h-4 w-4 mr-2" />
                Join Video Call
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground">
              Make sure you have a stable internet connection and your camera/microphone are working.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Call ended screen
  if (callStatus === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Call Ended</h2>
            <p className="mt-2 text-muted-foreground">
              Your video consultation has ended. Duration: {formatDuration(callDuration)}
            </p>
            
            <div className="mt-6 space-y-3">
              <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active call screen
  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Live
          </Badge>
          <div className="flex items-center gap-2 text-white/80">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatDuration(callDuration)}</span>
          </div>
        </div>
        
        <div className="text-white text-sm">
          {booking.hospitalId?.name || 'Video Consultation'}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative">
        {/* Remote video (main) */}
        <div className="absolute inset-0 bg-gray-800">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {callStatus === 'connecting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center text-white">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                <p>Connecting...</p>
              </div>
            </div>
          )}
          {callStatus === 'connected' && !remoteVideoRef.current?.srcObject && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                    {booking.doctorId ? 
                      `${booking.doctorId.firstName[0]}${booking.doctorId.lastName[0]}` : 
                      'DR'
                    }
                  </AvatarFallback>
                </Avatar>
                <p className="mt-4 text-white/70">Waiting for the doctor to join...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local video (picture-in-picture) */}
        <div className="absolute bottom-24 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-xl border-2 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
          />
          {!isVideoOn && (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {booking.patientInfo.firstName[0]}{booking.patientInfo.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/50 px-2 py-1 rounded">
            You
          </div>
        </div>

        {/* Chat panel */}
        {showChat && (
          <div className="absolute top-0 right-0 bottom-20 w-80 bg-gray-800/95 backdrop-blur border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-medium">Chat</h3>
              <Button variant="ghost" size="icon" className="text-white/70" onClick={() => setShowChat(false)}>
                <span className="text-lg">&times;</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-white/50 text-sm">No messages yet</p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`${msg.sender === 'You' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.sender === 'You' ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <p className="text-xs text-white/50 mt-1">{msg.time}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button size="icon" onClick={sendMessage}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-gray-800/90 backdrop-blur px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant={isMuted ? 'destructive' : 'secondary'}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={!isVideoOn ? 'destructive' : 'secondary'}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleVideo}
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? 'default' : 'secondary'}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleScreenShare}
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            variant={showChat ? 'default' : 'secondary'}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={endCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Camera</label>
              <select className="w-full mt-1 rounded-md border p-2">
                <option>Default Camera</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Microphone</label>
              <select className="w-full mt-1 rounded-md border p-2">
                <option>Default Microphone</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Speaker</label>
              <select className="w-full mt-1 rounded-md border p-2">
                <option>Default Speaker</option>
              </select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
