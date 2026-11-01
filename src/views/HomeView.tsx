import React, { useState } from 'react';
import { 
  Folder, 
  Clock, 
  Eye, 
  User, 
  Film, 
  Music2, 
  ExternalLink, 
  ArrowLeft,
  Loader2,
  Check,
  HardDrive
} from 'lucide-react';
import type { 
  VideoInfo, 
  DownloadMode, 
  VideoContainer, 
  AudioContainer, 
  DownloadOptions, 
  SystemInfo, 
  DownloadItem 
} from '../types';

interface HomeViewProps {
  videoInfo: VideoInfo | null;
  isLoading: boolean;
  onAnalyze: (url?: string) => void;
  onResetSearch: () => void;
  onStartDownload: (options: DownloadOptions) => void;
  systemInfo: SystemInfo | null;
  downloadsHistory: DownloadItem[];
  outputFolder: string;
  onSelectOutputFolder: () => void;
  onNavigateToDownloads: () => void;
}

export const getApproxFileSize = (
  duration: number,
  downloadMode: DownloadMode,
  height?: number,
  audioBitrate?: number,
  rawSize?: string
): string => {
  if (rawSize) return rawSize;
  const dur = Math.max(1, duration || 180);

  if (downloadMode === 'audio') {
    const abr = audioBitrate || 320;
    const mb = (abr * 1000 / 8 * dur) / (1024 * 1024);
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
    return `${mb.toFixed(1)} MB`;
  }

  const videoBitrates: Record<number, number> = {
    2160: 18000,
    1440: 9500,
    1080: 3800,
    720: 1800,
    480: 900,
    360: 500,
    240: 250,
    144: 150,
  };

  const h = downloadMode === 'best' ? (height || 2160) : (height || 1080);
  const vbr = videoBitrates[h] || (h >= 1080 ? 3800 : 1200);
  const abr = 160;
  const totalKbit = (vbr + abr) * dur;
  const mb = (totalKbit * 1000 / 8) / (1024 * 1024);

  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
};

export const HomeView: React.FC<HomeViewProps> = ({
  videoInfo,
  isLoading,
  onAnalyze,
  onResetSearch,
  onStartDownload,
  systemInfo,
  downloadsHistory,
  outputFolder,
  onSelectOutputFolder,
  onNavigateToDownloads,
}) => {
  const [localUrl, setLocalUrl] = useState<string>('');
  const [mode, setMode] = useState<DownloadMode>('best');
  const [selectedHeight, setSelectedHeight] = useState<number>(1080);
  const [selectedVideoContainer, setSelectedVideoContainer] = useState<VideoContainer>('mp4');
  const [selectedBitrate, setSelectedBitrate] = useState<number>(320);
  const [selectedAudioContainer, setSelectedAudioContainer] = useState<AudioContainer>('mp3');
  const [embedSubtitles, setEmbedSubtitles] = useState<boolean>(false);
  const [embedThumbnail, setEmbedThumbnail] = useState<boolean>(true);

  // Quick preset sample links for 1-click test
  const quickTestVideos = [
    { title: 'QR Studio', url: 'https://youtu.be/EgWu0P7omn4?si=whEyutTX9JeJSEuD' },
    { title: 'Job Track', url: 'https://youtu.be/cJR1fDAxZV4?si=w0QYmL8SZ6UgSPGc' },
    { title: '4K60fps sample', url: 'https://youtu.be/LXb3EKWsInQ?si=Zx-dOVryXqLFQfce' },
  ];

  // Auto-select highest available resolution when video loads
  React.useEffect(() => {
    if (videoInfo && videoInfo.videoQualities.length > 0) {
      setSelectedHeight(videoInfo.videoQualities[0].height);
    }
    if (videoInfo && videoInfo.audioQualities.length > 0) {
      setSelectedBitrate(videoInfo.audioQualities[0].abr);
    }
  }, [videoInfo]);

  const selectedVideoQuality =
    videoInfo?.videoQualities.find((v) => v.height === selectedHeight) ||
    videoInfo?.videoQualities[0];

  const selectedAudioQuality =
    videoInfo?.audioQualities.find((a) => a.abr === selectedBitrate) ||
    videoInfo?.audioQualities[0];

  const currentApproxSize = videoInfo
    ? mode === 'best'
      ? videoInfo.videoQualities[0]?.estimatedSize ||
        getApproxFileSize(videoInfo.duration, 'best', videoInfo.videoQualities[0]?.height)
      : mode === 'video'
      ? selectedVideoQuality?.estimatedSize ||
        getApproxFileSize(videoInfo.duration, 'video', selectedHeight)
      : selectedAudioQuality?.estimatedSize ||
        getApproxFileSize(videoInfo.duration, 'audio', undefined, selectedBitrate)
    : '';

  const handleStartDownload = () => {
    if (!videoInfo) return;

    const downloadId = 'dl_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const options: DownloadOptions = {
      id: downloadId,
      url: videoInfo.url,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      channel: videoInfo.uploader,
      duration: videoInfo.duration,
      mode,
      videoQualityHeight: selectedHeight,
      videoContainer: selectedVideoContainer,
      audioBitrate: selectedBitrate,
      audioContainer: selectedAudioContainer,
      outputFolder,
      embedSubtitles,
      embedThumbnail,
    };

    onStartDownload(options);
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localUrl.trim()) {
      onAnalyze(localUrl.trim());
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 lg:px-14 select-none flex flex-col">
      {!videoInfo ? (
        /* HERO SECTION - Centered in Window */
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto w-full py-12 my-auto animate-in fade-in duration-300">
          {/* Main Display Headline */}
          <div className="mb-6">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-[#2a0f14] leading-[1.08]">
              The download engine
              <br />
              behind{' '}
              <span className="bg-[#fae261] px-4 py-0.5 rounded-lg text-[#2a0f14] inline-block shadow-xs transform -rotate-0.5">
                irresistible
              </span>{' '}
              media
            </h1>
          </div>

          {/* Subtitle paragraph */}
          <p className="font-sans text-base sm:text-lg text-[#544145] max-w-xl mx-auto leading-relaxed mb-10 font-normal">
            Ultra-fast YouTube video & audio extraction powered by yt-dlp and FFmpeg. Turn online streams into pristine 4K 60fps files with lossless audio muxing and zero clutter.
          </p>

          {/* Interactive URL Form with Yellow Pill CTA Button */}
          <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative flex items-center bg-white/95 rounded-full border border-[#dfe0de] shadow-xs focus-within:border-[#2a0f14] focus-within:ring-2 focus-within:ring-[#fae261]/50 transition-all">
                <input
                  type="text"
                  value={localUrl}
                  onChange={(e) => setLocalUrl(e.target.value)}
                  placeholder="Paste YouTube video or music link..."
                  className="w-full py-4 pl-6 pr-4 bg-transparent text-sm text-[#2a0f14] placeholder-[#766e70] focus:outline-none font-medium text-left"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !localUrl.trim()}
                className="px-8 py-4 rounded-full bg-[#fae261] hover:bg-[#f9e47d] active:bg-[#e6bf24] text-[#2a0f14] font-display font-medium text-base shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Book a download</span>
                    <span className="text-xs font-black">▶</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Links below input */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-[#766e70]">
              <span className="font-semibold text-[#544145]">Quick try:</span>
              {quickTestVideos.map((video, idx) => (
                <button
                  key={idx}
                  onClick={() => onAnalyze(video.url)}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-[#fae261] border border-[#dfe0de] hover:border-[#2a0f14]/30 text-[#2a0f14] font-medium transition-all shadow-2xs hover:scale-105 active:scale-95"
                >
                  {video.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ANALYZED VIDEO VIEW - Cardless, Open & Minimalist Layout */
        <div className="max-w-4xl mx-auto py-6 animate-in fade-in duration-300">
          {/* Top Return Button & Status */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#dfe0de]">
            <button
              onClick={onResetSearch}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#544145] hover:text-[#2a0f14] transition-all group"
              title="Return to initial search screen"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to search</span>
            </button>

            <div className="flex items-center gap-3 text-xs font-semibold text-[#544145]">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d7f8e6] text-[#03af54]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Stream Analyzed</span>
              </span>
              <a
                href={videoInfo.url}
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1 text-[#766e70] hover:text-[#2a0f14]"
              >
                <span>Open YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Media Info & Configuration (Cardless, Spacious) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Visual Preview (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#2a0f14] shadow-sm border border-[#dfe0de] group">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-[#2a0f14]/80 backdrop-blur-md text-white text-[10px] font-bold">
                  {videoInfo.durationFormatted}
                </span>
              </div>

              {/* Channel & Stats row */}
              <div className="flex items-center justify-between text-xs text-[#544145] px-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#fae261] text-[#2a0f14] flex items-center justify-center font-bold text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-[#2a0f14]">{videoInfo.uploader}</span>
                </div>

                <div className="flex items-center gap-4 text-[#766e70]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{videoInfo.viewCount.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{videoInfo.durationFormatted}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Settings & Download CTA (7 cols) */}
            <div className="md:col-span-7 flex flex-col gap-6">
              {/* Title in ABC Solar */}
              <h2 className="font-display text-2xl lg:text-3xl font-medium text-[#2a0f14] leading-tight">
                {videoInfo.title}
              </h2>

              {/* Mode Selection Pills */}
              <div>
                <span className="text-xs font-semibold text-[#766e70] uppercase tracking-wider block mb-2">
                  Select Format
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setMode('best')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      mode === 'best'
                        ? 'bg-[#fae261] text-[#2a0f14] shadow-xs font-bold'
                        : 'bg-white/80 border border-[#dfe0de] text-[#544145] hover:text-[#2a0f14] hover:bg-white'
                    }`}
                  >
                    <span>Best Recommended</span>
                  </button>

                  <button
                    onClick={() => setMode('video')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      mode === 'video'
                        ? 'bg-[#fae261] text-[#2a0f14] shadow-xs font-bold'
                        : 'bg-white/80 border border-[#dfe0de] text-[#544145] hover:text-[#2a0f14] hover:bg-white'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Video (MP4/MKV)</span>
                  </button>

                  <button
                    onClick={() => setMode('audio')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      mode === 'audio'
                        ? 'bg-[#fae261] text-[#2a0f14] shadow-xs font-bold'
                        : 'bg-white/80 border border-[#dfe0de] text-[#544145] hover:text-[#2a0f14] hover:bg-white'
                    }`}
                  >
                    <Music2 className="w-3.5 h-3.5" />
                    <span>Audio Only</span>
                  </button>
                </div>
              </div>

              {/* Best Recommended mode details with Approx Size */}
              {mode === 'best' && (
                <div className="py-3.5 px-4 rounded-2xl bg-white/80 border border-[#dfe0de] text-xs text-[#544145] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span>
                      Highest resolution ({videoInfo.videoQualities[0]?.label || '4K 60fps'}) + 320kbps audio in MP4.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto font-bold text-[#2a0f14]">
                    <span className="text-[11px] text-[#766e70] font-normal">Approx size:</span>
                    <span className="bg-[#fae261] px-2.5 py-0.5 rounded-full text-xs shadow-xs">
                      ~{currentApproxSize}
                    </span>
                  </div>
                </div>
              )}

              {/* Video Mode details with Resolution Pills & Approx Sizes */}
              {mode === 'video' && (
                <div className="space-y-4">
                  {/* Container Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#766e70] uppercase tracking-wider">
                      Video Container
                    </span>
                    <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-lg border border-[#dfe0de] text-xs font-bold">
                      {(['mp4', 'mkv', 'webm'] as VideoContainer[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedVideoContainer(c)}
                          className={`px-2.5 py-1 rounded-md uppercase transition-all ${
                            selectedVideoContainer === c
                              ? 'bg-[#2a0f14] text-white shadow-xs'
                              : 'text-[#544145] hover:text-[#2a0f14]'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution Buttons with Approx Sizes */}
                  <div>
                    <span className="text-xs font-semibold text-[#766e70] uppercase tracking-wider block mb-2">
                      Available Video Resolutions & File Sizes
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {videoInfo.videoQualities.map((vq) => {
                        const isSelected = selectedHeight === vq.height;
                        const approxSize =
                          vq.estimatedSize ||
                          getApproxFileSize(videoInfo.duration, 'video', vq.height);

                        return (
                          <button
                            key={vq.height}
                            onClick={() => setSelectedHeight(vq.height)}
                            className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between gap-3 text-left ${
                              isSelected
                                ? 'bg-[#2a0f14] text-white shadow-xs'
                                : 'bg-white/80 border border-[#dfe0de] text-[#544145] hover:text-[#2a0f14] hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="truncate">{vq.label}</span>
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                isSelected ? 'bg-white/20 text-[#fae261]' : 'bg-[#f0f2ef] text-[#2a0f14]'
                              }`}
                            >
                              ~{approxSize}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Mode details with Format & Bitrate Pills with Approx Sizes */}
              {mode === 'audio' && (
                <div className="space-y-4">
                  {/* Container Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#766e70] uppercase tracking-wider">
                      Audio Codec / Container
                    </span>
                    <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-lg border border-[#dfe0de] text-xs font-bold">
                      {(['mp3', 'm4a', 'flac', 'wav'] as AudioContainer[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedAudioContainer(c)}
                          className={`px-2.5 py-1 rounded-md uppercase transition-all ${
                            selectedAudioContainer === c
                              ? 'bg-[#2a0f14] text-white shadow-xs'
                              : 'text-[#544145] hover:text-[#2a0f14]'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio Bitrate & Quality Options with Approx Sizes */}
                  <div>
                    <span className="text-xs font-semibold text-[#766e70] uppercase tracking-wider block mb-2">
                      Audio Quality & File Sizes
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {videoInfo.audioQualities.map((aq) => {
                        const isSelected = selectedBitrate === aq.abr;
                        const approxSize =
                          aq.estimatedSize ||
                          getApproxFileSize(videoInfo.duration, 'audio', undefined, aq.abr);

                        return (
                          <button
                            key={aq.abr}
                            onClick={() => setSelectedBitrate(aq.abr)}
                            className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between gap-3 text-left ${
                              isSelected
                                ? 'bg-[#2a0f14] text-white shadow-xs'
                                : 'bg-white/80 border border-[#dfe0de] text-[#544145] hover:text-[#2a0f14] hover:bg-white'
                            }`}
                          >
                            <span className="truncate">{aq.label}</span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                isSelected ? 'bg-white/20 text-[#fae261]' : 'bg-[#f0f2ef] text-[#2a0f14]'
                              }`}
                            >
                              ~{approxSize}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Destination folder selector */}
              <div>
                <span className="text-xs font-semibold text-[#766e70] uppercase tracking-wider block mb-1.5">
                  Save Folder
                </span>
                <div className="flex items-center gap-2 bg-white/70 border border-[#dfe0de] rounded-full py-2 px-4 text-xs">
                  <Folder className="w-3.5 h-3.5 text-[#766e70] flex-shrink-0" />
                  <span className="truncate flex-1 text-[#2a0f14] font-medium" title={outputFolder}>
                    {outputFolder}
                  </span>
                  <button
                    onClick={onSelectOutputFolder}
                    className="text-xs font-bold text-[#2a0f14] hover:underline flex-shrink-0"
                  >
                    Browse
                  </button>
                </div>
              </div>

              {/* Subtitles & Thumbnail toggles */}
              <div className="flex items-center gap-6 text-xs text-[#544145] font-medium">
                <label className="flex items-center gap-2 cursor-pointer hover:text-[#2a0f14]">
                  <input
                    type="checkbox"
                    checked={embedSubtitles}
                    onChange={(e) => setEmbedSubtitles(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#2a0f14]"
                  />
                  <span>Embed Subtitles</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-[#2a0f14]">
                  <input
                    type="checkbox"
                    checked={embedThumbnail}
                    onChange={(e) => setEmbedThumbnail(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#2a0f14]"
                  />
                  <span>Embed Thumbnail</span>
                </label>
              </div>

              {/* Selected Configuration & Approx Size Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 bg-white/80 border border-[#dfe0de] rounded-2xl text-xs gap-2 shadow-xs">
                <div className="flex items-center gap-2 text-[#544145]">
                  <span className="font-semibold text-[#766e70]">Config:</span>
                  <span className="font-bold text-[#2a0f14]">
                    {mode === 'best'
                      ? `Best Recommended (${videoInfo.videoQualities[0]?.label || '4K'})`
                      : mode === 'video'
                      ? `${selectedHeight}p ${selectedVideoContainer.toUpperCase()}`
                      : `${selectedBitrate} kbps ${selectedAudioContainer.toUpperCase()}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold text-[#2a0f14]">
                  <span className="text-[#766e70] font-normal">Approx Size:</span>
                  <span className="bg-[#fae261] px-3 py-1 rounded-full text-xs shadow-xs font-display">
                    ~{currentApproxSize}
                  </span>
                </div>
              </div>

              {/* CTA Start Download Button */}
              <button
                onClick={handleStartDownload}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#fae261] hover:bg-[#f9e47d] active:bg-[#e6bf24] text-[#2a0f14] font-display font-medium text-lg shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
              >
                <span>Download Video</span>
                <span className="text-sm font-black">▶</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
