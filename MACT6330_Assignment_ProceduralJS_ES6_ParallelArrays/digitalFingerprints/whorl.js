class Whorl extends window.DigitalFingerprint {
    generatePath(r, baseOffset) {
      let path = [];
      let spiralTurns = 2.2 + 2.5 * (r / this.ridges);
      for (let i = 0; i < this.pointsPerRidge * spiralTurns; i++) {
        let t = i / (this.pointsPerRidge * spiralTurns);
        let theta = t * Math.PI * 2 * spiralTurns;
        let flow = Math.sin(theta * 1.2 + r * 0.18) * 0.18 + Math.sin(theta * 3.1 + r * 0.5) * 0.07;
        let rr = baseOffset + 13 * t + 2 * Math.sin(theta * 2.5 + r * 0.7);
        let x = this.cx + rr * Math.cos(theta + flow) * 0.7;
        let y = this.cy + rr * Math.sin(theta + flow) * 1.15;
        path.push({x, y, t});
      }
      return path;
    }
  }

  window.Whorl = Whorl;