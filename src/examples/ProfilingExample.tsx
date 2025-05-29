import React, { useState, useCallback, useMemo, Profiler } from 'react';

// Slow component that simulates expensive rendering
const SlowComponent: React.FC<{ items: number[]; multiplier: number }> = ({ items, multiplier }) => {
  console.log('SlowComponent rendering...');
  
  // Simulate expensive calculation
  const expensiveCalculation = (num: number) => {
    let result = 0;
    for (let i = 0; i < 100000; i++) {
      result += Math.sqrt(num * i);
    }
    return result;
  };

  return (
    <div>
      <h4>Slow Component (No Optimization)</h4>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            Item {item}: {expensiveCalculation(item * multiplier).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Optimized version with memoization
const OptimizedComponent: React.FC<{ items: number[]; multiplier: number }> = React.memo(({ items, multiplier }) => {
  console.log('OptimizedComponent rendering...');
  
  const expensiveCalculation = useCallback((num: number) => {
    let result = 0;
    for (let i = 0; i < 100000; i++) {
      result += Math.sqrt(num * i);
    }
    return result;
  }, []);

  const calculatedItems = useMemo(() => {
    return items.map(item => ({
      value: item,
      result: expensiveCalculation(item * multiplier)
    }));
  }, [items, multiplier, expensiveCalculation]);

  return (
    <div>
      <h4>Optimized Component (With Memoization)</h4>
      <ul>
        {calculatedItems.map((item, index) => (
          <li key={index}>
            Item {item.value}: {item.result.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
});

const ProfilingExample: React.FC = () => {
  const [items, setItems] = useState<number[]>([1, 2, 3, 4, 5]);
  const [multiplier, setMultiplier] = useState(1);
  const [counter, setCounter] = useState(0);
  const [showOptimized, setShowOptimized] = useState(false);

  // Profiler callback to log render information
  const onRenderCallback = (
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    console.log(`Profiler [${id}]:`, {
      phase,
      actualDuration: `${actualDuration.toFixed(2)}ms`,
      baseDuration: `${baseDuration.toFixed(2)}ms`,
      startTime: `${startTime.toFixed(2)}ms`,
      commitTime: `${commitTime.toFixed(2)}ms`,
      efficiency: `${((baseDuration - actualDuration) / baseDuration * 100).toFixed(1)}% improvement`
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, prev.length + 1]);
  };

  const removeItem = () => {
    setItems(prev => prev.slice(0, -1));
  };

  const incrementCounter = () => {
    setCounter(prev => prev + 1);
  };

  return (
    <div className="example-page">
      <h2>🔍 Profiling React Applications</h2>
      
      <div className="example-section">
        <h3>Understanding React DevTools Profiler</h3>
        <p>
          The React DevTools Profiler helps identify performance bottlenecks by measuring 
          how long components take to render. Open your browser's DevTools and navigate 
          to the "Profiler" tab to see the performance data.
        </p>
        
        <div className="warning">
          <strong>📊 How to Use:</strong>
          <ol>
            <li>Open React DevTools (F12 → Profiler tab)</li>
            <li>Click the record button (🔴)</li>
            <li>Interact with the components below</li>
            <li>Stop recording to analyze the flame chart</li>
            <li>Check the console for programmatic profiler data</li>
          </ol>
        </div>
      </div>

      <div className="controls">
        <button className="btn" onClick={addItem}>Add Item</button>
        <button className="btn" onClick={removeItem} disabled={items.length === 0}>
          Remove Item
        </button>
        <button className="btn" onClick={incrementCounter}>
          Increment Counter ({counter})
        </button>
        <button className="btn" onClick={() => setMultiplier(prev => prev + 1)}>
          Increase Multiplier ({multiplier})
        </button>
        <button 
          className="btn" 
          onClick={() => setShowOptimized(!showOptimized)}
          style={{ backgroundColor: showOptimized ? '#28a745' : '#dc3545' }}
        >
          {showOptimized ? 'Show Slow Version' : 'Show Optimized Version'}
        </button>
      </div>

      <div className="performance-demo">
        <div className="demo-section">
          <Profiler id="SlowComponent" onRender={onRenderCallback}>
            {!showOptimized ? (
              <SlowComponent items={items} multiplier={multiplier} />
            ) : (
              <OptimizedComponent items={items} multiplier={multiplier} />
            )}
          </Profiler>
        </div>

        <div className="demo-section">
          <h4>Performance Metrics</h4>
          <div className="metrics">
            <div>Items: {items.length}</div>
            <div>Multiplier: {multiplier}</div>
            <div>Counter: {counter}</div>
            <div>Component Type: {showOptimized ? 'Optimized' : 'Slow'}</div>
          </div>
          
          <div className="success">
            <strong>🎯 What to Look For:</strong>
            <ul>
              <li><strong>Flame Chart:</strong> Wide bars = slow components</li>
              <li><strong>Colors:</strong> Yellow = slow, Blue = fast, Gray = didn't render</li>
              <li><strong>actualDuration vs baseDuration:</strong> Shows memoization effectiveness</li>
              <li><strong>Render Frequency:</strong> How often components re-render</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="example-section">
        <h3>Key Profiling Insights</h3>
        
        <div className="code-block">
{`// Profiler API Usage
<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>

// onRender callback parameters:
const onRenderCallback = (
  id,              // "MyComponent"
  phase,           // "mount" | "update" | "nested-update"
  actualDuration,  // Time spent rendering (ms)
  baseDuration,    // Estimated time without memoization (ms)
  startTime,       // When React began rendering
  commitTime       // When React committed the update
) => {
  console.log({ id, phase, actualDuration, baseDuration });
};`}
        </div>

        <div className="warning">
          <strong>⚠️ Common Performance Issues to Identify:</strong>
          <ul>
            <li><strong>Excessive Re-renders:</strong> Components rendering when props/state haven't changed</li>
            <li><strong>Slow Components:</strong> Wide yellow bars in flame chart</li>
            <li><strong>Cascade Updates:</strong> One state change triggering many component updates</li>
            <li><strong>Ineffective Memoization:</strong> actualDuration ≈ baseDuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfilingExample; 