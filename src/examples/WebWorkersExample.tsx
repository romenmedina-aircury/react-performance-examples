import React, { useState, useCallback, useRef, useEffect } from 'react';

// Heavy computation function that would block the main thread
const heavyComputation = (data: number[], iterations: number) => {
  const result = [];
  for (let i = 0; i < iterations; i++) {
    const processed = data.map(num => {
      // Simulate complex mathematical operations
      let value = num;
      for (let j = 0; j < 1000; j++) {
        value = Math.sqrt(value * Math.sin(value) + Math.cos(value));
      }
      return value;
    });
    result.push(processed.reduce((sum, val) => sum + val, 0));
  }
  return result;
};

// Fibonacci calculation (CPU intensive)
const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

// Prime number calculation
const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
};

const findPrimesInRange = (start: number, end: number): number[] => {
  const primes = [];
  for (let i = start; i <= end; i++) {
    if (isPrime(i)) {
      primes.push(i);
    }
  }
  return primes;
};

// Main thread computation component
const MainThreadComputation: React.FC = () => {
  const [isComputing, setIsComputing] = useState(false);
  const [result, setResult] = useState<number[]>([]);
  const [computationTime, setComputationTime] = useState(0);
  const [uiBlocked, setUiBlocked] = useState(false);

  const runHeavyComputation = useCallback(() => {
    setIsComputing(true);
    setUiBlocked(true);
    setResult([]);
    
    const startTime = performance.now();
    
    // This will block the UI thread
    setTimeout(() => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1);
      const computationResult = heavyComputation(data, 100);
      
      const endTime = performance.now();
      setComputationTime(endTime - startTime);
      setResult(computationResult);
      setIsComputing(false);
      setUiBlocked(false);
    }, 10);
  }, []);

  const runFibonacci = useCallback(() => {
    setIsComputing(true);
    setUiBlocked(true);
    
    const startTime = performance.now();
    
    setTimeout(() => {
      const fibResult = fibonacci(40); // This will take a while
      const endTime = performance.now();
      
      setComputationTime(endTime - startTime);
      setResult([fibResult]);
      setIsComputing(false);
      setUiBlocked(false);
    }, 10);
  }, []);

  return (
    <div className="demo-section">
      <h4>🐌 Main Thread Computation (Blocks UI)</h4>
      
      <div className="controls">
        <button 
          className="btn" 
          onClick={runHeavyComputation}
          disabled={isComputing}
        >
          {isComputing ? 'Computing...' : 'Run Heavy Computation'}
        </button>
        
        <button 
          className="btn" 
          onClick={runFibonacci}
          disabled={isComputing}
        >
          {isComputing ? 'Computing...' : 'Calculate Fibonacci(40)'}
        </button>
      </div>

      {uiBlocked && (
        <div className="warning">
          <strong>⚠️ UI is blocked!</strong> Try clicking buttons or scrolling while computation runs.
        </div>
      )}

      <div className="metrics">
        <div><strong>Status:</strong> {isComputing ? 'Computing...' : 'Idle'}</div>
        <div><strong>Computation Time:</strong> {computationTime.toFixed(2)}ms</div>
        <div><strong>Results:</strong> {result.length > 0 ? `${result.length} values computed` : 'None'}</div>
        {result.length > 0 && result.length === 1 && (
          <div><strong>Fibonacci Result:</strong> {result[0]}</div>
        )}
      </div>

      {/* UI responsiveness test */}
      <div style={{ marginTop: '20px' }}>
        <h5>UI Responsiveness Test:</h5>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          marginTop: '10px'
        }}>
          {Array.from({ length: 10 }, (_, i) => (
            <button 
              key={i}
              className="btn"
              style={{ 
                padding: '5px 10px',
                backgroundColor: uiBlocked ? '#dc3545' : '#28a745'
              }}
              onClick={() => console.log(`Button ${i + 1} clicked`)}
            >
              Test {i + 1}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          Try clicking these buttons during computation to see UI blocking.
        </p>
      </div>
    </div>
  );
};

// Web Worker computation component
const WebWorkerComputation: React.FC = () => {
  const [isComputing, setIsComputing] = useState(false);
  const [result, setResult] = useState<number[]>([]);
  const [computationTime, setComputationTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create worker from inline script
    const workerScript = `
      // Heavy computation function
      const heavyComputation = (data, iterations) => {
        const result = [];
        for (let i = 0; i < iterations; i++) {
          const processed = data.map(num => {
            let value = num;
            for (let j = 0; j < 1000; j++) {
              value = Math.sqrt(value * Math.sin(value) + Math.cos(value));
            }
            return value;
          });
          result.push(processed.reduce((sum, val) => sum + val, 0));
          
          // Report progress
          if (i % 10 === 0) {
            self.postMessage({ 
              type: 'progress', 
              progress: (i / iterations) * 100 
            });
          }
        }
        return result;
      };

      // Fibonacci calculation
      const fibonacci = (n) => {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      };

      // Prime number functions
      const isPrime = (num) => {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;
        
        for (let i = 5; i * i <= num; i += 6) {
          if (num % i === 0 || num % (i + 2) === 0) return false;
        }
        return true;
      };

      const findPrimesInRange = (start, end) => {
        const primes = [];
        const total = end - start + 1;
        
        for (let i = start; i <= end; i++) {
          if (isPrime(i)) {
            primes.push(i);
          }
          
          // Report progress
          if ((i - start) % 1000 === 0) {
            self.postMessage({ 
              type: 'progress', 
              progress: ((i - start) / total) * 100 
            });
          }
        }
        return primes;
      };

      self.onmessage = function(e) {
        const { type, data } = e.data;
        const startTime = performance.now();
        
        try {
          let result;
          
          switch (type) {
            case 'heavyComputation':
              result = heavyComputation(data.numbers, data.iterations);
              break;
            case 'fibonacci':
              result = [fibonacci(data.n)];
              break;
            case 'findPrimes':
              result = findPrimesInRange(data.start, data.end);
              break;
            default:
              throw new Error('Unknown computation type');
          }
          
          const endTime = performance.now();
          
          self.postMessage({
            type: 'result',
            result,
            computationTime: endTime - startTime
          });
        } catch (error) {
          self.postMessage({
            type: 'error',
            error: error.message
          });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    workerRef.current.onmessage = (e) => {
      const { type, result, computationTime, progress, error } = e.data;
      
      if (type === 'result') {
        setResult(result);
        setComputationTime(computationTime);
        setIsComputing(false);
        setProgress(100);
      } else if (type === 'progress') {
        setProgress(progress);
      } else if (type === 'error') {
        console.error('Worker error:', error);
        setIsComputing(false);
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const runHeavyComputation = useCallback(() => {
    if (!workerRef.current) return;
    
    setIsComputing(true);
    setResult([]);
    setProgress(0);
    
    const data = Array.from({ length: 1000 }, (_, i) => i + 1);
    workerRef.current.postMessage({
      type: 'heavyComputation',
      data: { numbers: data, iterations: 100 }
    });
  }, []);

  const runFibonacci = useCallback(() => {
    if (!workerRef.current) return;
    
    setIsComputing(true);
    setResult([]);
    setProgress(0);
    
    workerRef.current.postMessage({
      type: 'fibonacci',
      data: { n: 40 }
    });
  }, []);

  const runPrimeCalculation = useCallback(() => {
    if (!workerRef.current) return;
    
    setIsComputing(true);
    setResult([]);
    setProgress(0);
    
    workerRef.current.postMessage({
      type: 'findPrimes',
      data: { start: 1, end: 100000 }
    });
  }, []);

  return (
    <div className="demo-section">
      <h4>🚀 Web Worker Computation (Non-blocking)</h4>
      
      <div className="controls">
        <button 
          className="btn" 
          onClick={runHeavyComputation}
          disabled={isComputing}
        >
          {isComputing ? 'Computing...' : 'Run Heavy Computation'}
        </button>
        
        <button 
          className="btn" 
          onClick={runFibonacci}
          disabled={isComputing}
        >
          {isComputing ? 'Computing...' : 'Calculate Fibonacci(40)'}
        </button>
        
        <button 
          className="btn" 
          onClick={runPrimeCalculation}
          disabled={isComputing}
        >
          {isComputing ? 'Computing...' : 'Find Primes (1-100k)'}
        </button>
      </div>

      {isComputing && (
        <div className="success">
          <strong>✅ UI remains responsive!</strong> The computation runs in a background thread.
          <div style={{ marginTop: '10px' }}>
            <div style={{ 
              width: '100%', 
              height: '20px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#28a745',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: '5px' }}>
              Progress: {progress.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      <div className="metrics">
        <div><strong>Status:</strong> {isComputing ? 'Computing...' : 'Idle'}</div>
        <div><strong>Computation Time:</strong> {computationTime.toFixed(2)}ms</div>
        <div><strong>Results:</strong> {result.length > 0 ? `${result.length} values computed` : 'None'}</div>
        {result.length > 0 && result.length === 1 && (
          <div><strong>Result:</strong> {result[0]}</div>
        )}
        {result.length > 1 && result.length < 1000 && (
          <div><strong>Prime Count:</strong> {result.length} primes found</div>
        )}
      </div>

      {/* UI responsiveness test */}
      <div style={{ marginTop: '20px' }}>
        <h5>UI Responsiveness Test:</h5>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          marginTop: '10px'
        }}>
          {Array.from({ length: 10 }, (_, i) => (
            <button 
              key={i}
              className="btn"
              style={{ 
                padding: '5px 10px',
                backgroundColor: '#28a745'
              }}
              onClick={() => console.log(`Worker button ${i + 1} clicked`)}
            >
              Test {i + 1}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          These buttons remain responsive even during heavy computation!
        </p>
      </div>
    </div>
  );
};

// Animation component to test UI responsiveness
const ResponsivenessTest: React.FC = () => {
  const [animationRunning, setAnimationRunning] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (animationRunning) {
      interval = setInterval(() => {
        setCounter(prev => prev + 1);
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [animationRunning]);

  return (
    <div className="example-section">
      <h3>UI Responsiveness Test</h3>
      
      <div className="controls">
        <button 
          className="btn" 
          onClick={() => setAnimationRunning(!animationRunning)}
        >
          {animationRunning ? 'Stop Animation' : 'Start Animation'}
        </button>
        <button 
          className="btn" 
          onClick={() => setCounter(0)}
        >
          Reset Counter
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#ffd700',
          borderRadius: '50%',
          transform: `rotate(${counter * 10}deg)`,
          transition: animationRunning ? 'none' : 'transform 0.3s ease'
        }} />
        
        <div>
          <div><strong>Counter:</strong> {counter}</div>
          <div><strong>Animation:</strong> {animationRunning ? 'Running' : 'Stopped'}</div>
        </div>
      </div>

      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        This animation helps visualize UI blocking. When the main thread is blocked,
        the animation will freeze. With Web Workers, it continues smoothly.
      </p>
    </div>
  );
};

const WebWorkersExample: React.FC = () => {
  return (
    <div className="example-page">
      <h2>⚡ Web Workers for Performance</h2>
      
      <div className="example-section">
        <h3>Offloading Heavy Computations</h3>
        <p>
          Web Workers allow you to run JavaScript in background threads, keeping the main UI thread 
          responsive during heavy computations. This is crucial for maintaining smooth user interactions 
          while processing large datasets or performing complex calculations.
        </p>
      </div>

      <ResponsivenessTest />

      <div className="performance-demo">
        <MainThreadComputation />
        <WebWorkerComputation />
      </div>

      <div className="example-section">
        <h3>Web Worker Implementation</h3>
        
        <div className="code-block">
{`// Creating a Web Worker
const workerScript = \`
  self.onmessage = function(e) {
    const { type, data } = e.data;
    
    // Perform heavy computation
    const result = heavyComputation(data);
    
    // Send result back to main thread
    self.postMessage({
      type: 'result',
      result,
      computationTime: performance.now() - startTime
    });
  };
\`;

const blob = new Blob([workerScript], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));

// Send data to worker
worker.postMessage({ type: 'compute', data: largeDataset });

// Receive results
worker.onmessage = (e) => {
  const { result } = e.data;
  setResult(result);
};`}
        </div>

        <div className="success">
          <strong>✅ Web Worker Benefits:</strong>
          <ul>
            <li><strong>Non-blocking:</strong> UI remains responsive during computation</li>
            <li><strong>Parallel Processing:</strong> Utilize multiple CPU cores</li>
            <li><strong>Better UX:</strong> Users can continue interacting with the app</li>
            <li><strong>Progress Updates:</strong> Workers can report computation progress</li>
            <li><strong>Error Isolation:</strong> Worker crashes don't affect main thread</li>
          </ul>
        </div>

        <div className="warning">
          <strong>⚠️ Web Worker Limitations:</strong>
          <ul>
            <li><strong>No DOM Access:</strong> Workers can't directly manipulate the DOM</li>
            <li><strong>Limited APIs:</strong> Some browser APIs are not available</li>
            <li><strong>Data Transfer Cost:</strong> Large objects are cloned, not shared</li>
            <li><strong>Browser Support:</strong> Check compatibility for older browsers</li>
            <li><strong>Debugging:</strong> More complex to debug than main thread code</li>
          </ul>
        </div>

        <div className="info">
          <strong>💡 When to Use Web Workers:</strong>
          <ul>
            <li><strong>Heavy Calculations:</strong> Mathematical computations, data processing</li>
            <li><strong>Image/Video Processing:</strong> Filters, transformations, encoding</li>
            <li><strong>Data Parsing:</strong> Large JSON/CSV files, data transformation</li>
            <li><strong>Cryptography:</strong> Encryption, hashing, key generation</li>
            <li><strong>Background Tasks:</strong> Periodic data fetching, cache management</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WebWorkersExample; 