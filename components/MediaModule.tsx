import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Play, Pause, SkipForward, Volume2, Film, Music, FileText, ChevronLeft, ChevronRight, Minimize } from 'lucide-react';

interface MediaModuleProps {
  onClose: () => void;
}

interface Track {
  title: string;
  artist: string;
  duration: string;
  seconds: number;
  url?: string;
}

interface Magazine {
  title: string;
  issue: string;
  pages: string[];
}

export const MediaModule: React.FC<MediaModuleProps> = ({ onClose }) => {
  const [activeMode, setActiveMode] = useState<'video' | 'audio' | 'pdf'>('video');
  
  // 1. Video (SVBC Live Channel) States
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [liveViewers, setLiveViewers] = useState(4821);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 2. Audio (Devotional Chants) States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioIntervalRef = useRef<any>(null);

  const playlist: Track[] = [
    { title: 'Sri Venkateswara Suprabhatam', artist: 'M.S. Subbulakshmi', duration: '20:14', seconds: 1214 },
    { title: 'Govinda Namavali (Chant)', artist: 'Traditional Vedic Choir', duration: '10:45', seconds: 645 },
    { title: 'Bhaja Govindam', artist: 'Sri Adi Sankaracharya Hymns', duration: '08:30', seconds: 510 },
    { title: 'Srivari Annaprasadam Bhajan', artist: 'Devotee Congregation', duration: '06:12', seconds: 372 }
  ];

  // 3. PDF Magazine States
  const [activePdf, setActivePdf] = useState<Magazine | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const magazines: Magazine[] = [
    {
      title: 'Sapthagiri Monthly Magazine',
      issue: 'June 2026 Issue',
      pages: [
        '🕉️ SAPTHAGIRI - Official Journal of TTD\n\nWelcome to the sacred June edition.\n\nIn this issue:\n- The glory of Sri Venkateswara Temple festivals.\n- Vedic roots of charity and Anna Prasadam.\n- Spiritual practices for householders in Kali Yuga.',
        '📖 ARTICLE 1: Srivari Brahmotsavam Glories\n\nThe annual Brahmotsavam is a festival of grand proportions. Instituted by Lord Brahma himself, the festival cleanses all sins. The Lord Venkateswara rides on various vahanas (vehicles) during these nine days to bless devotees.',
        '📖 ARTICLE 2: The Philosophy of Seva (Service)\n\nCharity (Dana) is highly praised in the Vedas. By feeding the hungry through TTD Srivari Annaprasadam, one attains the highest spiritual merits. Service to mankind is truly service to Madhava (God).',
        '📖 ARTICLE 3: Sacred Pilgrimage Guidelines\n\nDevotees visiting the holy hills are advised to maintain absolute silence and chant "Om Namo Venkatesaya". Adhering to the traditional dress codes and respecting temple guidelines enhances the pilgrimage experience for all.'
      ]
    },
    {
      title: 'Srivari Mahatmyam (Sacred Text)',
      issue: 'Special Edition',
      pages: [
        '🕉️ SRIVARI MAHATMYAM\n\nThe Divine Story of Lord Venkateswara\'s manifestation on Tirumala Hills.\n\nPart 1: The Descent of the Lord.\nPart 2: The Divine Marriage with Goddess Padmavathi.\nPart 3: The Holy Tirumala Shrine.',
        '📖 CHAPTER 1: Bhrigu Maharshi\'s Test\n\nTo determine who among the Holy Trinity is the most patient, sage Bhrigu visited Vaikuntha. Lord Vishnu bore the sage\'s anger with compassion, prompting Goddess Lakshmi to descend to Earth in Vaikuntha\'s absence.',
        '📖 CHAPTER 2: Manifestation as Srinivasa\n\nLord Vishnu descended to Earth as Srinivasa. Residing in Varaha Kshethram on the Venkatachala Hills, Srinivasa sought the hand of Princess Padmavathi, daughter of King Akasa Raja, marking the sacred union.'
      ]
    }
  ];

  // SVBC Video simulated playback animation
  useEffect(() => {
    if (activeMode !== 'video' || !isVideoPlaying) return;

    const canvas = videoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let angle = 0;

    const render = () => {
      // Draw TV simulated screen
      ctx.fillStyle = '#0a0502';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw dynamic orange-maroon spiritual energy wave patterns to simulate live stream
      ctx.fillStyle = 'rgba(194, 89, 0, 0.15)';
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = Math.sin(x * 0.02 + angle) * 20 + canvas.height / 2;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fill();

      // Draw secondary golden wave
      ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = Math.cos(x * 0.015 + angle * 1.5) * 15 + canvas.height / 2 + 10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fill();

      // TV Channel details
      ctx.fillStyle = 'var(--gold)';
      ctx.font = 'bold 14px var(--font-sans)';
      ctx.fillText('SVBC LIVE - TTD Channel', 15, 25);
      
      // Live flashing indicator
      ctx.fillStyle = (Math.floor(Date.now() / 500) % 2 === 0) ? '#ff0000' : 'rgba(255,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(15, 45, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px var(--font-sans)';
      ctx.fillText('LIVE', 25, 48);

      // Devotee count
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(`👁️ ${liveViewers} Devotees Watching`, 15, canvas.height - 15);

      angle += 0.05;
      animFrame = requestAnimationFrame(render);
    };

    render();
    
    // Simulate active viewer count fluctuations
    const viewerInterval = setInterval(() => {
      setLiveViewers(prev => prev + Math.floor(Math.random() * 21) - 10);
    }, 3000);

    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(viewerInterval);
    };
  }, [activeMode, isVideoPlaying, liveViewers]);

  // Audio Playback simulation
  useEffect(() => {
    if (isPlaying) {
      audioIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const track = playlist[currentTrackIndex];
          if (prev >= track.seconds) {
            // Next track
            setCurrentTrackIndex(p => (p + 1) % playlist.length);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    }

    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, [isPlaying, currentTrackIndex]);

  const handleAudioPlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const activeTrack = playlist[currentTrackIndex];
  const audioPercentage = (currentTime / activeTrack.seconds) * 100;

  return (
    <div style={{
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      animation: 'fadeIn var(--transition-normal) forwards',
      textAlign: 'left'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="font-spiritual" style={{ fontSize: '15px', color: 'var(--secondary)', fontWeight: 'bold' }}>
          TTD Media & Publications
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Minimize size={14} /> Close
        </button>
      </div>

      {/* Mode Selectors */}
      {!activePdf && (
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '6px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'video', label: 'SVBC Live', icon: <Film size={14} /> },
            { id: 'audio', label: 'Bhajans', icon: <Music size={14} /> },
            { id: 'pdf', label: 'E-Books', icon: <FileText size={14} /> }
          ].map(mode => {
            const active = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode.id as any);
                  setIsPlaying(false); // Stop audio if switching
                }}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: active ? 'var(--primary)' : 'transparent',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {mode.icon}
                {mode.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 1. SVBC Live Stream Screen */}
      {activeMode === 'video' && !activePdf && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '210px',
            backgroundColor: '#000',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)'
          }}>
            <canvas
              ref={videoCanvasRef}
              width={372}
              height={210}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />

            {/* Simulated TV play button overlay */}
            {!isVideoPlaying && (
              <div
                onClick={() => setIsVideoPlaying(true)}
                style={{
                  position: 'absolute',
                  left: 0, top: 0, width: '100%', height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Play size={24} style={{ marginLeft: '4px' }} />
                </div>
              </div>
            )}
          </div>

          {/* Video controls bar */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--primary)', display: 'flex', alignItems: 'center'
              }}
            >
              {isVideoPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Broadcasting via INSAT-4A Satellite link
            </span>

            <Volume2 size={18} color="var(--text-muted)" />
          </div>
        </div>
      )}

      {/* 2. Audio Chants Playlist & Wave Player */}
      {activeMode === 'audio' && !activePdf && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Active Audio Wave visualizer Panel */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            padding: '20px 16px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '42px',
              border: '1.5px solid var(--primary)',
              marginBottom: '14px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              🪔
            </div>
            
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {activeTrack.title}
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {activeTrack.artist}
            </p>

            {/* Equalizer animation */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: '3px',
              height: '32px',
              margin: '16px 0 8px 0'
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
                const heightVal = isPlaying ? Math.floor(Math.random() * 24) + 6 : 4;
                return (
                  <div
                    key={bar}
                    style={{
                      width: '4px',
                      height: `${heightVal}px`,
                      backgroundColor: 'var(--primary)',
                      borderRadius: '2px',
                      transition: 'height 0.2s ease'
                    }}
                  />
                );
              })}
            </div>

            {/* Custom scrubber progress slider */}
            <div style={{ width: '100%', marginTop: '12px' }}>
              <div style={{
                height: '4px',
                width: '100%',
                backgroundColor: 'var(--border-color)',
                borderRadius: '2px',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${audioPercentage}%`,
                  backgroundColor: 'var(--primary)',
                  borderRadius: '2px'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                <span>{formatTime(currentTime)}</span>
                <span>{activeTrack.duration}</span>
              </div>
            </div>

            {/* Music Controls */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '14px' }}>
              <button
                onClick={handleAudioPlayToggle}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: 'var(--primary)', border: 'none',
                  color: '#ffffff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
              </button>
              
              <button
                onClick={handleNextTrack}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-secondary)', cursor: 'pointer'
                }}
              >
                <SkipForward size={22} />
              </button>
            </div>
          </div>

          {/* Playlist selection list */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '10px'
          }}>
            <h5 style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', padding: '6px', borderBottom: '1px solid var(--border-color)' }}>
              Sacred Tracks
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              {playlist.map((track, idx) => {
                const isActive = currentTrackIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setCurrentTime(0);
                      setIsPlaying(true);
                    }}
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? 'var(--primary-dark)' : 'var(--text-primary)' }}>
                        {track.title}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {track.artist}
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{track.duration}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 3. PDF Magazine Reader Portal */}
      {activeMode === 'pdf' && (
        !activePdf ? (
          // PDF Selection List
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {magazines.map((mag, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {mag.title}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {mag.issue} | {mag.pages.length} Pages
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActivePdf(mag);
                    setCurrentPage(0);
                  }}
                >
                  Read
                </Button>
              </div>
            ))}
          </div>
        ) : (
          // Active E-Book Reader Layout
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Nav Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setActivePdf(null)}
                style={{
                  background: 'none', border: 'none', color: 'var(--primary)',
                  fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                }}
              >
                <ChevronLeft size={16} /> Library
              </button>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Page {currentPage + 1} of {activePdf.pages.length}
              </span>
            </div>

            {/* Simulated Paper Book Page Content */}
            <div style={{
              backgroundColor: '#fffdf4', // Traditional paper color
              color: '#1a1815',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '24px 20px',
              minHeight: '260px',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05), var(--shadow-sm)',
              fontSize: '13px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              textAlign: 'left'
            }}>
              {activePdf.pages[currentPage]}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                leftIcon={<ChevronLeft size={16} />}
                style={{ flex: 1 }}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(activePdf.pages.length - 1, prev + 1))}
                disabled={currentPage === activePdf.pages.length - 1}
                rightIcon={<ChevronRight size={16} />}
                style={{ flex: 1 }}
              >
                Next
              </Button>
            </div>

          </div>
        )
      )}

    </div>
  );
};
