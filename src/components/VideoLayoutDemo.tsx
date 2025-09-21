'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type VideoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface VideoLayoutDemoProps {
  onSettingsChange?: (settings: { position: VideoPosition; size: number }) => void;
  initialPosition?: VideoPosition;
  initialSize?: number;
}

export default function VideoLayoutDemo({ onSettingsChange, initialPosition = 'bottom-right', initialSize = 200 }: VideoLayoutDemoProps) {
  const [position, setPosition] = useState<VideoPosition>(initialPosition);
  const [size, setSize] = useState<number>(initialSize);

  // Sync with external changes
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  useEffect(() => {
    setSize(initialSize);
  }, [initialSize]);

  // Sample avatar image for demo
  const avatarSrc = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face";

  const handlePositionChange = (newPosition: VideoPosition) => {
    setPosition(newPosition);
    onSettingsChange?.({ position: newPosition, size });
  };

  const handleSizeChange = (newSize: number[]) => {
    const sizeValue = newSize[0];
    setSize(sizeValue);
    onSettingsChange?.({ position, size: sizeValue });
  };

  const getPositionStyles = (pos: VideoPosition, diameter: number) => {
    const margin = 20;
    switch (pos) {
      case 'top-left':
        return { top: margin, left: margin };
      case 'top-right':
        return { top: margin, right: margin };
      case 'bottom-left':
        return { bottom: margin, left: margin };
      case 'bottom-right':
        return { bottom: margin, right: margin };
      default:
        return { bottom: margin, right: margin };
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Video Layout Preview</CardTitle>
        <CardDescription>
          Customize how your talking head video will appear on website screenshots
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select value={position} onValueChange={handlePositionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size: {size}px</Label>
            <Slider
              id="size"
              min={100}
              max={400}
              step={20}
              value={[size]}
              onValueChange={handleSizeChange}
              className="w-full"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          {/* Aspect ratio container for 1920x1080 preview */}
          <div className="aspect-video w-full relative">
            {/* Background placeholder */}
            <div className="absolute inset-0 bg-white flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <div className="text-2xl font-light mb-2">Website Screenshot</div>
                <div className="text-sm">Your website background will appear here</div>
              </div>
            </div>

            {/* Talking head video overlay */}
            <div
              className="absolute rounded-full overflow-hidden border-4 border-white shadow-lg"
              style={{
                width: `${(size / 1920) * 100}%`,
                height: `${(size / 1080) * 100}%`,
                ...getPositionStyles(position, size)
              }}
            >
              <img
                src={avatarSrc}
                alt="Demo avatar"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Position indicator */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
              Position: {position.replace('-', ' ')} | Size: {size}px
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Preview Notes:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your talking head video will appear as a perfect circle at the selected position</li>
            <li>• The website screenshot will fill the entire background</li>
            <li>• Size is measured in pixels (recommended: 200-300px for best visibility)</li>
            <li>• The white border and shadow will be added automatically for better visibility</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}