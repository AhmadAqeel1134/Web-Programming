/* ============================================
   Photo Editor - Core Functionality
   CS-4032 Web Programming Assignment
   ============================================ */

// ========== STATE MANAGEMENT ==========
class PhotoEditorState {
    constructor() {
        // Replace with your actual roll number's last 2 digits
        const rollNumber = 221134; // Example: Change this to your roll number
        const lastTwoDigits = rollNumber % 100;
        this.filterStep = (lastTwoDigits % 2 === 0) ? 2 : 3;

        // Image state
        this.originalImage = null;
        this.currentImage = null;
        this.canvas = null;
        this.ctx = null;

        // Filter values
        this.filters = {
            brightness: 100,
            saturation: 100,
            inversion: 0,
            grayscale: 0,
            sepia: 0,
            blur: 0
        };

        // Transform values
        this.rotation = 0;
        this.flipHorizontal = false;
        this.flipVertical = false;

        // History system
        this.historyStack = [];
        this.currentHistoryIndex = -1;
        this.maxHistorySize = 50;

        // Original image as data URL for preview
        this.originalImageDataURL = null;

        // UI elements
        this.elements = {};

        // Initialize
        this.init();
    }

    init() {
        // Get canvas and context
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Get all UI elements
        this.elements = {
            fileInput: document.getElementById('fileInput'),
            loadBtn: document.getElementById('loadBtn'),
            saveBtn: document.getElementById('saveBtn'),
            resetBtn: document.getElementById('resetBtn'),
            canvasOverlay: document.getElementById('canvasOverlay'),

            // Sliders
            brightnessSlider: document.getElementById('brightnessSlider'),
            saturationSlider: document.getElementById('saturationSlider'),
            inversionSlider: document.getElementById('inversionSlider'),
            grayscaleSlider: document.getElementById('grayscaleSlider'),
            sepiaSlider: document.getElementById('sepiaSlider'),
            blurSlider: document.getElementById('blurSlider'),
            rotateSlider: document.getElementById('rotateSlider'),

            // Value displays
            brightnessValue: document.getElementById('brightnessValue'),
            saturationValue: document.getElementById('saturationValue'),
            inversionValue: document.getElementById('inversionValue'),
            grayscaleValue: document.getElementById('grayscaleValue'),
            sepiaValue: document.getElementById('sepiaValue'),
            blurValue: document.getElementById('blurValue'),
            rotateValue: document.getElementById('rotateValue'),

            // Buttons
            flipHorizontalBtn: document.getElementById('flipHorizontalBtn'),
            flipVerticalBtn: document.getElementById('flipVerticalBtn'),
            undoBtn: document.getElementById('undoBtn'),
            redoBtn: document.getElementById('redoBtn'),

            // History panel
            historyPanel: document.getElementById('historyPanel'),

            // Preview thumbnails
            originalPreview: document.getElementById('originalPreview'),
            currentPreview: document.getElementById('currentPreview')
        };

        // Set slider steps based on roll number logic
        this.elements.brightnessSlider.step = this.filterStep;
        this.elements.saturationSlider.step = this.filterStep;

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // File loading
        this.elements.loadBtn.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            this.loadImage(e.target.files[0]);
        });

        // Save and reset
        this.elements.saveBtn.addEventListener('click', () => this.saveImage());
        this.elements.resetBtn.addEventListener('click', () => this.resetImage());

        // Filter sliders
        this.elements.brightnessSlider.addEventListener('input', (e) => {
            this.updateFilter('brightness', parseInt(e.target.value));
        });

        this.elements.saturationSlider.addEventListener('input', (e) => {
            this.updateFilter('saturation', parseInt(e.target.value));
        });

        this.elements.inversionSlider.addEventListener('input', (e) => {
            this.updateFilter('inversion', parseInt(e.target.value));
        });

        this.elements.grayscaleSlider.addEventListener('input', (e) => {
            this.updateFilter('grayscale', parseInt(e.target.value));
        });

        this.elements.sepiaSlider.addEventListener('input', (e) => {
            this.updateFilter('sepia', parseInt(e.target.value));
        });

        this.elements.blurSlider.addEventListener('input', (e) => {
            this.updateFilter('blur', parseFloat(e.target.value));
        });

        // Transform controls
        this.elements.rotateSlider.addEventListener('input', (e) => {
            this.updateRotation(parseInt(e.target.value));
        });

        this.elements.flipHorizontalBtn.addEventListener('click', () => {
            this.flipHorizontal = !this.flipHorizontal;
            this.saveState();
            this.applyFilters();
        });

        this.elements.flipVerticalBtn.addEventListener('click', () => {
            this.flipVertical = !this.flipVertical;
            this.saveState();
            this.applyFilters();
        });

        // History controls
        this.elements.undoBtn.addEventListener('click', () => this.undo());
        this.elements.redoBtn.addEventListener('click', () => this.redo());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }
        });
    }

    // ========== IMAGE LOADING ==========
    loadImage(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataURL = e.target.result;
            this.originalImageDataURL = dataURL;
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.currentImage = img;

                // Reset all filters
                this.resetFilters();

                // Clear history
                this.historyStack = [];
                this.currentHistoryIndex = -1;
                this.updateHistoryUI();

                // Setup canvas
                this.setupCanvas(img);

                // Hide overlay
                this.elements.canvasOverlay.classList.add('hidden');

                // Enable buttons
                this.elements.saveBtn.disabled = false;
                this.elements.resetBtn.disabled = false;

                // Update preview thumbnails
                this.updatePreviews();

                // Save initial state
                this.saveState();
            };
            img.src = dataURL;
        };
        reader.readAsDataURL(file);
    }

    setupCanvas(img) {
        // Calculate canvas size to fit container while maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
        }

        this.canvas.width = width;
        this.canvas.height = height;

        this.applyFilters();
    }

    // ========== FILTER APPLICATION ==========
    applyFilters() {
        if (!this.currentImage) return;

        const width = this.canvas.width;
        const height = this.canvas.height;

        // Create temporary canvas for pixel filters (apply filters before transformations)
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw original image to temp canvas
        tempCtx.drawImage(this.currentImage, 0, 0, width, height);

        // Get image data for filter application
        const imageData = tempCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Apply pixel-level filters
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Brightness
            if (this.filters.brightness !== 100) {
                const factor = this.filters.brightness / 100;
                r = Math.min(255, r * factor);
                g = Math.min(255, g * factor);
                b = Math.min(255, b * factor);
            }

            // Saturation
            if (this.filters.saturation !== 100) {
                const factor = this.filters.saturation / 100;
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = Math.min(255, gray + (r - gray) * factor);
                g = Math.min(255, gray + (g - gray) * factor);
                b = Math.min(255, gray + (b - gray) * factor);
            }

            // Grayscale
            if (this.filters.grayscale > 0) {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                const factor = this.filters.grayscale / 100;
                r = r * (1 - factor) + gray * factor;
                g = g * (1 - factor) + gray * factor;
                b = b * (1 - factor) + gray * factor;
            }

            // Sepia
            if (this.filters.sepia > 0) {
                const factor = this.filters.sepia / 100;
                const tr = 0.393 * r + 0.769 * g + 0.189 * b;
                const tg = 0.349 * r + 0.686 * g + 0.168 * b;
                const tb = 0.272 * r + 0.534 * g + 0.131 * b;
                r = r * (1 - factor) + Math.min(255, tr) * factor;
                g = g * (1 - factor) + Math.min(255, tg) * factor;
                b = b * (1 - factor) + Math.min(255, tb) * factor;
            }

            // Inversion
            if (this.filters.inversion > 0) {
                const factor = this.filters.inversion / 100;
                r = r * (1 - factor) + (255 - r) * factor;
                g = g * (1 - factor) + (255 - g) * factor;
                b = b * (1 - factor) + (255 - b) * factor;
            }

            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }

        // Put modified image data back to temp canvas
        tempCtx.putImageData(imageData, 0, 0);

        // Clear main canvas
        this.ctx.clearRect(0, 0, width, height);

        // Save context state for transformations
        this.ctx.save();

        // Apply rotation
        this.ctx.translate(width / 2, height / 2);
        this.ctx.rotate((this.rotation * Math.PI) / 180);

        // Apply flips
        let scaleX = this.flipHorizontal ? -1 : 1;
        let scaleY = this.flipVertical ? -1 : 1;
        this.ctx.scale(scaleX, scaleY);

        // Draw filtered image with transformations
        this.ctx.drawImage(tempCanvas, -width / 2, -height / 2, width, height);

        // Restore context
        this.ctx.restore();

        // Apply blur using CSS filter (since canvas blur is complex)
        if (this.filters.blur > 0) {
            this.canvas.style.filter = `blur(${this.filters.blur}px)`;
        } else {
            this.canvas.style.filter = 'none';
        }

        // Update preview thumbnails
        this.updatePreviews();

        // Add visual feedback
        const canvasWrapper = this.canvas.closest('.canvas-wrapper');
        canvasWrapper.classList.add('filter-active');
        setTimeout(() => {
            canvasWrapper.classList.remove('filter-active');
        }, 500);
    }

    updatePreviews() {
        const origEl = this.elements.originalPreview;
        const currEl = this.elements.currentPreview;
        if (!origEl || !currEl) return;

        if (this.originalImageDataURL) {
            if (!origEl.querySelector('img')) {
                const img = document.createElement('img');
                img.alt = 'Original';
                origEl.innerHTML = '';
                origEl.appendChild(img);
            }
            origEl.querySelector('img').src = this.originalImageDataURL;
        } else {
            origEl.innerHTML = '<span class="preview-placeholder">—</span>';
        }

        if (this.canvas && this.originalImage && this.canvas.width > 0) {
            try {
                const dataURL = this.canvas.toDataURL('image/png');
                if (!currEl.querySelector('img')) {
                    const img = document.createElement('img');
                    img.alt = 'Edited';
                    currEl.innerHTML = '';
                    currEl.appendChild(img);
                }
                currEl.querySelector('img').src = dataURL;
            } catch (err) {
                currEl.innerHTML = '<span class="preview-placeholder">—</span>';
            }
        } else {
            currEl.innerHTML = '<span class="preview-placeholder">—</span>';
        }
    }

    // ========== FILTER UPDATES ==========
    updateFilter(filterName, value) {
        this.filters[filterName] = value;
        this.updateFilterDisplay(filterName, value);
        this.saveState();
        this.applyFilters();
    }

    updateFilterDisplay(filterName, value) {
        const displayMap = {
            brightness: this.elements.brightnessValue,
            saturation: this.elements.saturationValue,
            inversion: this.elements.inversionValue,
            grayscale: this.elements.grayscaleValue,
            sepia: this.elements.sepiaValue,
            blur: this.elements.blurValue
        };

        const element = displayMap[filterName];
        if (element) {
            if (filterName === 'blur') {
                element.textContent = value.toFixed(1);
            } else {
                element.textContent = value;
            }
        }
    }

    updateRotation(value) {
        this.rotation = value;
        this.elements.rotateValue.textContent = `${value}°`;
        this.saveState();
        this.applyFilters();
    }

    resetFilters() {
        this.filters = {
            brightness: 100,
            saturation: 100,
            inversion: 0,
            grayscale: 0,
            sepia: 0,
            blur: 0
        };

        this.rotation = 0;
        this.flipHorizontal = false;
        this.flipVertical = false;

        // Reset sliders
        this.elements.brightnessSlider.value = 100;
        this.elements.saturationSlider.value = 100;
        this.elements.inversionSlider.value = 0;
        this.elements.grayscaleSlider.value = 0;
        this.elements.sepiaSlider.value = 0;
        this.elements.blurSlider.value = 0;
        this.elements.rotateSlider.value = 0;

        // Reset displays
        this.updateFilterDisplay('brightness', 100);
        this.updateFilterDisplay('saturation', 100);
        this.updateFilterDisplay('inversion', 0);
        this.updateFilterDisplay('grayscale', 0);
        this.updateFilterDisplay('sepia', 0);
        this.updateFilterDisplay('blur', 0);
        this.elements.rotateValue.textContent = '0°';

        // Reset canvas filter
        this.canvas.style.filter = 'none';
    }

    // ========== HISTORY SYSTEM ==========
    saveState() {
        // Remove any states after current index (when user makes new edit after undo)
        if (this.currentHistoryIndex < this.historyStack.length - 1) {
            this.historyStack = this.historyStack.slice(0, this.currentHistoryIndex + 1);
        }

        // Create state snapshot
        const state = {
            filters: { ...this.filters },
            rotation: this.rotation,
            flipHorizontal: this.flipHorizontal,
            flipVertical: this.flipVertical,
            timestamp: Date.now()
        };

        // Add to history
        this.historyStack.push(state);

        // Limit history size
        if (this.historyStack.length > this.maxHistorySize) {
            this.historyStack.shift();
        } else {
            this.currentHistoryIndex = this.historyStack.length - 1;
        }

        this.updateHistoryUI();
    }

    loadState(state) {
        // Restore filter values
        this.filters = { ...state.filters };
        this.rotation = state.rotation;
        this.flipHorizontal = state.flipHorizontal;
        this.flipVertical = state.flipVertical;

        // Update sliders
        this.elements.brightnessSlider.value = this.filters.brightness;
        this.elements.saturationSlider.value = this.filters.saturation;
        this.elements.inversionSlider.value = this.filters.inversion;
        this.elements.grayscaleSlider.value = this.filters.grayscale;
        this.elements.sepiaSlider.value = this.filters.sepia;
        this.elements.blurSlider.value = this.filters.blur;
        this.elements.rotateSlider.value = this.rotation;

        // Update displays
        this.updateFilterDisplay('brightness', this.filters.brightness);
        this.updateFilterDisplay('saturation', this.filters.saturation);
        this.updateFilterDisplay('inversion', this.filters.inversion);
        this.updateFilterDisplay('grayscale', this.filters.grayscale);
        this.updateFilterDisplay('sepia', this.filters.sepia);
        this.updateFilterDisplay('blur', this.filters.blur);
        this.elements.rotateValue.textContent = `${this.rotation}°`;

        // Apply filters
        this.applyFilters();
    }

    undo() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--;
            const state = this.historyStack[this.currentHistoryIndex];
            this.loadState(state);
            this.updateHistoryUI();
        }
    }

    redo() {
        if (this.currentHistoryIndex < this.historyStack.length - 1) {
            this.currentHistoryIndex++;
            const state = this.historyStack[this.currentHistoryIndex];
            this.loadState(state);
            this.updateHistoryUI();
        }
    }

    jumpToHistory(index) {
        if (index >= 0 && index < this.historyStack.length) {
            this.currentHistoryIndex = index;
            const state = this.historyStack[index];
            this.loadState(state);
            this.updateHistoryUI();
        }
    }

    updateHistoryUI() {
        // Update undo/redo buttons
        this.elements.undoBtn.disabled = this.currentHistoryIndex <= 0;
        this.elements.redoBtn.disabled = this.currentHistoryIndex >= this.historyStack.length - 1;

        // Update history panel
        const panel = this.elements.historyPanel;
        panel.innerHTML = '';

        if (this.historyStack.length === 0) {
            panel.innerHTML = '<p class="history-empty">No history yet</p>';
            return;
        }

        // Create history items (show last 10)
        const startIndex = Math.max(0, this.historyStack.length - 10);
        for (let i = startIndex; i < this.historyStack.length; i++) {
            const state = this.historyStack[i];
            const item = document.createElement('div');
            item.className = 'history-item';
            if (i === this.currentHistoryIndex) {
                item.classList.add('active');
            }

            // Create description
            const desc = this.getStateDescription(state, i);
            item.textContent = desc;

            // Add click handler
            item.addEventListener('click', () => {
                this.jumpToHistory(i);
            });

            panel.appendChild(item);
        }
    }

    getStateDescription(state, index) {
        const parts = [];

        if (state.filters.brightness !== 100) {
            parts.push(`Brightness: ${state.filters.brightness}`);
        }
        if (state.filters.saturation !== 100) {
            parts.push(`Saturation: ${state.filters.saturation}`);
        }
        if (state.filters.inversion > 0) {
            parts.push(`Inversion: ${state.filters.inversion}%`);
        }
        if (state.filters.grayscale > 0) {
            parts.push(`Grayscale: ${state.filters.grayscale}%`);
        }
        if (state.filters.sepia > 0) {
            parts.push(`Sepia: ${state.filters.sepia}%`);
        }
        if (state.filters.blur > 0) {
            parts.push(`Blur: ${state.filters.blur}px`);
        }
        if (state.rotation !== 0) {
            parts.push(`Rotate: ${state.rotation}°`);
        }
        if (state.flipHorizontal) {
            parts.push('Flip H');
        }
        if (state.flipVertical) {
            parts.push('Flip V');
        }

        if (parts.length === 0) {
            return `State ${index + 1} - Original`;
        }

        return `State ${index + 1} - ${parts.slice(0, 2).join(', ')}${parts.length > 2 ? '...' : ''}`;
    }

    // ========== SAVE & RESET ==========
    saveImage() {
        if (!this.canvas) return;

        // Create download link
        this.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `edited-image-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    resetImage() {
        if (!this.originalImage) return;

        // Reset to original image
        this.currentImage = this.originalImage;
        this.resetFilters();

        // Clear history and save initial state
        this.historyStack = [];
        this.currentHistoryIndex = -1;
        this.saveState();

        this.applyFilters();
    }
}

// ========== INITIALIZE APPLICATION ==========
// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.photoEditor = new PhotoEditorState();
    });
} else {
    window.photoEditor = new PhotoEditorState();
}
