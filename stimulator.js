document.getElementById('simulateBtn').addEventListener('click', () => {
    const requestInput = document.getElementById('requestSequence').value;
    const startHead = parseInt(document.getElementById('startHead').value);
    const algorithm = document.getElementById('algorithm').value;
    const outputDiv = document.getElementById('output');
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
  
    if (!requestInput || isNaN(startHead)) {
      alert('Please enter valid inputs.');
      return;
    }
  
    let requests = requestInput.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
    if (requests.length === 0) {
      alert('Request sequence is empty or invalid.');
      return;
    }
  
    // Add starting head position to the beginning
    let sequence = [startHead, ...schedule(requests, startHead, algorithm)];
    let totalMovement = calculateTotalMovement(sequence);
    
    // Display Output
    outputDiv.innerHTML = `
      <p><strong>Sequence:</strong> ${sequence.join(' → ')}</p>
      <p><strong>Total Head Movement:</strong> ${totalMovement} cylinders</p>
    `;
  
    // Draw
    drawChart(ctx, sequence);
  });
  
  function schedule(requests, head, algorithm) {
    let sorted = [...requests].sort((a, b) => a - b);
    let left = sorted.filter(r => r < head);
    let right = sorted.filter(r => r >= head);
  
    switch (algorithm) {
      case 'FCFS':
        return requests;
      case 'SSTF':
        return sstf(requests, head);
      case 'SCAN':
        return [...right, ...left.reverse()];
      case 'CSCAN':
        return [...right, ...left];
      case 'LOOK':
        return [...right, ...left.reverse()];
      case 'CLOOK':
        return [...right, ...left];
      default:
        return requests;
    }
  }
  
  function sstf(requests, head) {
    let queue = [...requests];
    let result = [];
  
    while (queue.length > 0) {
      let nearestIndex = 0;
      let minDistance = Math.abs(queue[0] - head);
  
      for (let i = 1; i < queue.length; i++) {
        let dist = Math.abs(queue[i] - head);
        if (dist < minDistance) {
          nearestIndex = i;
          minDistance = dist;
        }
      }
  
      head = queue[nearestIndex];
      result.push(head);
      queue.splice(nearestIndex, 1);
    }
  
    return result;
  }
  
  function calculateTotalMovement(sequence) {
    let movement = 0;
    for (let i = 1; i < sequence.length; i++) {
      movement += Math.abs(sequence[i] - sequence[i - 1]);
    }
    return movement;
  }
  
  function drawChart(ctx, sequence) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
    const padding = 50;
    const width = ctx.canvas.width - 2 * padding;
    const height = ctx.canvas.height - 2 * padding;
    const spacing = width / (sequence.length - 1);
    const maxCylinder = Math.max(...sequence);
    const minCylinder = Math.min(...sequence);
  
    ctx.beginPath();
    ctx.moveTo(padding, height - normalize(sequence[0], minCylinder, maxCylinder, height) + padding);
    for (let i = 1; i < sequence.length; i++) {
      const x = padding + spacing * i;
      const y = height - normalize(sequence[i], minCylinder, maxCylinder, height) + padding;
      ctx.lineTo(x, y);
    }
  
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 2;
    ctx.stroke();
  
    // Draw points
    for (let i = 0; i < sequence.length; i++) {
      const x = padding + spacing * i;
      const y = height - normalize(sequence[i], minCylinder, maxCylinder, height) + padding;
  
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
  
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText(sequence[i], x - 10, y - 10);
    }
  }
  
  function normalize(value, min, max, height) {
    return ((value - min) / (max - min)) * height;
  }
  