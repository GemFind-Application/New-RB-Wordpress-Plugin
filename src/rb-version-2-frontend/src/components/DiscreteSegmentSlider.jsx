import React, { useState, useRef, useEffect } from 'react';
import './DiscreteSegmentSlider.css';

const DiscreteSegmentSlider = ({ 
    segments = [], 
    value = [0, 0], 
    onChange,
    excludeLast = false 
}) => {
    const sliderRef = useRef(null);
    const [isDragging, setIsDragging] = useState(null); // 'min' or 'max' or null
    const [localValue, setLocalValue] = useState(value);
    const [dragPosition, setDragPosition] = useState(null); // Current drag position in percentage

    // Display segments, excluding "Last" if excludeLast is true
    const displaySegments = excludeLast 
        ? segments.filter(seg => seg.label !== "Last")
        : segments;
    const maxDisplayIndex = displaySegments.length - 1;
    
    // Helper to adjust value indices when excludeLast is true
    const adjustValueForExcludeLast = React.useCallback((val) => {
        if (!excludeLast || segments.length === displaySegments.length) {
            return val;
        }
        const lastIndex = segments.findIndex(seg => seg.label === "Last");
        if (lastIndex === -1) {
            return val;
        }
        const [minIdx, maxIdx] = val;
        let adjustedMaxIdx = maxIdx;
        // If maxIdx points to "Last" or beyond, clamp to last display segment
        if (maxIdx >= lastIndex) {
            adjustedMaxIdx = displaySegments.length - 1;
        }
        return [minIdx, adjustedMaxIdx];
    }, [excludeLast, segments, displaySegments.length]);

    useEffect(() => {
        const adjustedValue = adjustValueForExcludeLast(value);
        setLocalValue(adjustedValue);
    }, [value, adjustValueForExcludeLast]);

    if (!segments || segments.length === 0) {
        return null;
    }

    const segmentWidth = 100 / displaySegments.length;

    const getSegmentIndexFromPosition = React.useCallback((clientX) => {
        if (!sliderRef.current) return 0;
        const rect = sliderRef.current.getBoundingClientRect();
        const percentage = ((clientX - rect.left) / rect.width) * 100;
        
        // Find the nearest segment by calculating distance to each segment center
        let nearestIndex = 0;
        let minDistance = Infinity;
        
        for (let i = 0; i <= maxDisplayIndex; i++) {
            // Calculate segment center position
            const segmentCenter = (i + 0.5) * segmentWidth;
            const distance = Math.abs(percentage - segmentCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }
        
        return Math.max(0, Math.min(nearestIndex, maxDisplayIndex));
    }, [segmentWidth, maxDisplayIndex]);

    const getPercentageFromPosition = React.useCallback((clientX) => {
        if (!sliderRef.current) return 0;
        const rect = sliderRef.current.getBoundingClientRect();
        const percentage = ((clientX - rect.left) / rect.width) * 100;
        return Math.max(0, Math.min(100, percentage));
    }, []);

    const handleSegmentClick = (index) => {
        const [minIdx, maxIdx] = localValue;
        
            // If clicking on a segment within the current range, toggle it
        if (index >= minIdx && index <= maxIdx) {
            // If it's a single segment selection, expand to include adjacent
            if (minIdx === maxIdx) {
                if (index === minIdx) {
                    // Expand right if possible
                    if (index < maxDisplayIndex) {
                        updateValue('max', index + 1);
                    } else {
                        // Expand left if possible
                        if (index > 0) {
                            updateValue('min', index - 1);
                        }
                    }
                }
            } else {
                // Split the range or contract
                if (index === minIdx && minIdx < maxIdx) {
                    updateValue('min', minIdx + 1);
                } else if (index === maxIdx && maxIdx > minIdx) {
                    updateValue('max', maxIdx - 1);
                } else {
                    // Click in middle, split range
                    updateValue('max', index);
                }
            }
        } else {
            // Click outside current range
            if (index < minIdx) {
                updateValue('min', index);
            } else {
                updateValue('max', index);
            }
        }
    };

    const updateValue = (type, index) => {
        const [minIdx, maxIdx] = localValue;
        let newMin = minIdx;
        let newMax = maxIdx;

        if (type === 'min') {
            newMin = Math.max(0, Math.min(index, maxIdx));
        } else if (type === 'max') {
            newMax = Math.max(newMin, Math.min(index, maxDisplayIndex));
        }

        // Ensure min <= max
        if (newMin > newMax) {
            if (type === 'min') {
                newMax = newMin;
            } else {
                newMin = newMax;
            }
        }

        const newValue = [newMin, newMax];
        setLocalValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    useEffect(() => {
        if (!isDragging) {
            setDragPosition(null);
            return;
        }

        let rafId = null;

        const moveHandler = (e) => {
            e.preventDefault();
            const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
            if (clientX === undefined) return;
            
            // Cancel any pending animation frame
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            // Use requestAnimationFrame to throttle updates
            rafId = requestAnimationFrame(() => {
                // Get percentage position
                const percentage = getPercentageFromPosition(clientX);
                
                // Find nearest segment by calculating distance to each segment center
                let nearestIndex = 0;
                let minDistance = Infinity;
                
                for (let i = 0; i <= maxDisplayIndex; i++) {
                    // Calculate segment center position
                    const segmentCenter = (i + 0.5) * segmentWidth;
                    const distance = Math.abs(percentage - segmentCenter);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestIndex = i;
                    }
                }
                
                // Calculate the snapped position for visual feedback
                let snappedPercentage;
                if (isDragging === 'min') {
                    snappedPercentage = nearestIndex * segmentWidth;
                } else {
                    snappedPercentage = Math.min(100, (nearestIndex + 1) * segmentWidth);
                }
                
                setDragPosition(snappedPercentage);
                
                // Update the value immediately to snap to segment (discrete stepping)
                setLocalValue((prevValue) => {
                    const [minIdx, maxIdx] = prevValue;
                    let newMin = minIdx;
                    let newMax = maxIdx;

                    if (isDragging === 'min') {
                        newMin = Math.max(0, Math.min(nearestIndex, maxIdx));
                    } else if (isDragging === 'max') {
                        newMax = Math.max(minIdx, Math.min(nearestIndex, maxDisplayIndex));
                    }

                    if (newMin > newMax) {
                        if (isDragging === 'min') {
                            newMax = newMin;
                        } else {
                            newMin = newMax;
                        }
                    }

                    const newValue = [newMin, newMax];
                    // Call onChange during drag so parent component gets updates
                    if (onChange) {
                        onChange(newValue);
                    }
                    return newValue;
                });
            });
        };

        const upHandler = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            
            // Value is already updated during drag with snapping, just clean up
            setIsDragging(null);
            setDragPosition(null);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', upHandler);
        
        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', upHandler);
        };
    }, [isDragging, getSegmentIndexFromPosition, getPercentageFromPosition, segmentWidth, maxDisplayIndex, onChange, localValue]);

    const [minIdx, maxIdx] = localValue;
    
    // Calculate selected range - use drag position during drag for smooth preview
    let selectedStart = minIdx * segmentWidth;
    let selectedWidth = (maxIdx - minIdx + 1) * segmentWidth;
    
    // During drag, show smooth preview of selection
    if (isDragging === 'min' && dragPosition !== null) {
        const currentMaxPos = (maxIdx + 1) * segmentWidth;
        selectedStart = dragPosition;
        selectedWidth = currentMaxPos - dragPosition;
    } else if (isDragging === 'max' && dragPosition !== null) {
        const currentMinPos = minIdx * segmentWidth;
        selectedStart = currentMinPos;
        selectedWidth = dragPosition - currentMinPos;
    }
    
    // Position handles at segment edges when not dragging
    // During drag, use smooth dragPosition for visual feedback
    let minHandlePosition = Math.max(0, minIdx * segmentWidth);
    let maxHandlePosition = Math.min(100, (maxIdx + 1) * segmentWidth);
    
    // During drag, use smooth cursor position (not snapped)
    if (isDragging === 'min' && dragPosition !== null) {
        minHandlePosition = dragPosition;
    } else if (isDragging === 'max' && dragPosition !== null) {
        maxHandlePosition = dragPosition;
    }
    
    return (
        <div className="discrete-segment-slider-container">
            <div 
                ref={sliderRef}
                className="discrete-segment-slider-track"
                onMouseDown={(e) => {
                    const index = getSegmentIndexFromPosition(e.clientX);
                    handleSegmentClick(index);
                }}
            >
                {/* Rail */}
                <div className="discrete-segment-slider-rail" />
                
                {/* Segments with dividers */}
                {displaySegments.map((segment, index) => {
                    const isSelected = index >= minIdx && index <= maxIdx;
                    
                    return (
                        <div
                            key={index}
                            className={`discrete-segment ${isSelected ? 'selected' : ''}`}
                            style={{
                                left: `${index * segmentWidth}%`,
                                width: `${segmentWidth}%`
                            }}
                        >
                            {/* Segment divider - show between all segments */}
                            {index < displaySegments.length - 1 && (
                                <div className="discrete-segment-divider" />
                            )}
                        </div>
                    );
                })}
                
                {/* Selected range track - rendered on top of segments */}
                <div 
                    className="discrete-segment-slider-selected"
                    style={{
                        left: `${selectedStart}%`,
                        width: `${selectedWidth}%`
                    }}
                />
                
                {/* Min handle */}
                <div
                    className={`discrete-segment-handle discrete-segment-handle-min ${isDragging === 'min' ? 'dragging' : ''}`}
                    style={{ left: `${minHandlePosition}%` }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsDragging('min');
                    }}
                    onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsDragging('min');
                    }}
                />
                
                {/* Max handle */}
                <div
                    className={`discrete-segment-handle discrete-segment-handle-max ${isDragging === 'max' ? 'dragging' : ''}`}
                    style={{ left: `${maxHandlePosition}%` }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsDragging('max');
                    }}
                    onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsDragging('max');
                    }}
                />
            </div>
            
            {/* Labels */}
            <div className="discrete-segment-labels">
                {displaySegments.map((segment, index) => (
                    <div
                        key={index}
                        className="discrete-segment-label"
                        style={{ width: `${segmentWidth}%` }}
                    >
                        {segment.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiscreteSegmentSlider;

