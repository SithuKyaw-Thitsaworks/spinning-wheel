class SpinWheel {
    constructor(options = {}) {
        this.segments = options.segments || [
            { label: 'Prize 1', color: '#FF6B6B' },
            { label: 'Prize 2', color: '#4ECDC4' },
            { label: 'Prize 3', color: '#45B7D1' },
            { label: 'Prize 4', color: '#96CEB4' },
            { label: 'Prize 5', color: '#FFEEAD' },
            { label: 'Prize 6', color: '#D4A5A5' },
            { label: 'Prize 7', color: '#9ED2C6' },
            { label: 'Prize 8', color: '#FFB6B8' }
        ];
        this.spinDuration = options.spinDuration || 5000;
        this.onSpinEnd = options.onSpinEnd || ((segment) => console.log('Won:', segment));
        this.currentRotation = 0;
        this.isSpinning = false;

        this.wheelSvg = document.querySelector('.wheel-svg');
        this.spinButton = document.querySelector('.spin-button');

        this.init();
    }

    init() {
        this.drawWheel();
        this.spinButton.addEventListener('click', () => {
            let predefinedIndex = document.getElementById("segmentInput").value;

            if(Number(predefinedIndex) > this.segments.length){
                alert("Invalid segment idex.");
                return;
            }
        
            
            if(Number(predefinedIndex) === 0){
                this.spin();
            }
            else {
                this.spin(Number(predefinedIndex) - 1)
            }
            
        });
    }

    drawWheel() {
        const svgNS = "http://www.w3.org/2000/svg";
        const segmentAngle = 360 / this.segments.length;

        this.segments.forEach((segment, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;

            // Create segment path
            const path = document.createElementNS(svgNS, "path");
            const rad = segmentAngle * Math.PI / 180;
            const pathData = `M50 50 L50 0 A50 50 0 0 1 ${50 + 50 * Math.sin(rad)} ${50 - 50 * Math.cos(rad)} Z`;

            path.setAttribute("d", pathData);
            path.setAttribute("fill", segment.color);
            path.setAttribute("transform", `rotate(${startAngle} 50 50)`);

            // Create segment text
            const text = document.createElementNS(svgNS, "text");
            text.textContent = segment.label;
            text.setAttribute("x", "50");
            text.setAttribute("y", "20");
            text.setAttribute("class", "segment-text");
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("transform", `
                rotate(${startAngle + segmentAngle / 2} 50 50)
            `);

            this.wheelSvg.appendChild(path);
            this.wheelSvg.appendChild(text);
        });
    }

    spin(forcedSegmentIndex = null) {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.spinButton.disabled = true;

        const segmentSize = 360 / this.segments.length;
        let targetRotation;

        if (forcedSegmentIndex !== null) {
            const targetSegmentCenter = 360 - (forcedSegmentIndex * segmentSize + segmentSize / 2);
            targetRotation = targetSegmentCenter + 1440; // 4 full rotations
        } else {
            targetRotation = 1440 + Math.random() * 1440; // Random between 4-8 rotations
        }

        this.wheelSvg.style.transition = `transform ${this.spinDuration}ms cubic-bezier(0.32, 0.94, 0.60, 1)`;
        this.wheelSvg.style.transform = `rotate(${targetRotation}deg)`;

        setTimeout(() => {
            // Calculate winning segment
            const remainder = targetRotation % 360;
            const finalSegmentIndex = Math.floor(((360 - remainder) / segmentSize) % this.segments.length);

            // Reset rotation to the remainder and remove transition
            this.wheelSvg.style.transition = 'none';
            this.wheelSvg.style.transform = `rotate(${remainder}deg)`;

            // Force a reflow to apply the transform immediately
            void this.wheelSvg.offsetWidth;

            // Restore transition for the next spin
            this.wheelSvg.style.transition = `transform ${this.spinDuration}ms cubic-bezier(0.32, 0.94, 0.60, 1)`;

            // Re-enable the spin button and reset the spinning flag
            this.isSpinning = false;
            this.spinButton.disabled = false;

            // Trigger the spin end callback
            this.onSpinEnd(this.segments[finalSegmentIndex]);
        }, this.spinDuration);
    }

}

// Initialize the wheel
const wheel = new SpinWheel({
    onSpinEnd: (segment) => {
        alert(`Congratulations! You won: ${segment.label}`);
    }
});