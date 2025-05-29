import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

// Component without memoization
const ExpensiveChildComponent: React.FC<{ 
  data: number[]; 
  onItemClick: (item: number) => void;
  config: { multiplier: number };
}> = ({ data, onItemClick, config }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  console.log(`ExpensiveChildComponent rendered ${renderCount.current} times`);

  // Expensive calculation on every render
  const processedData = data.map(item => {
    let result = item;
    for (let i = 0; i < 10000; i++) {
      result += Math.sqrt(item * config.multiplier);
    }
    return result;
  });

  return (
    <div>
      <h4>❌ Without Memoization (Renders: {renderCount.current})</h4>
      <ul>
        {processedData.slice(0, 5).map((item, index) => (
          <li key={index} onClick={() => onItemClick(data[index])}>
            Item {data[index]}: {item.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Component with React.memo
const MemoizedChildComponent = React.memo<{ 
  data: number[]; 
  onItemClick: (item: number) => void;
  config: { multiplier: number };
}>(({ data, onItemClick, config }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  console.log(`MemoizedChildComponent rendered ${renderCount.current} times`);

  // Still expensive, but won't run if props haven't changed
  const processedData = useMemo(() => {
    console.log('Expensive calculation running...');
    return data.map(item => {
      let result = item;
      for (let i = 0; i < 10000; i++) {
        result += Math.sqrt(item * config.multiplier);
      }
      return result;
    });
  }, [data, config.multiplier]);

  return (
    <div>
      <h4>✅ With React.memo + useMemo (Renders: {renderCount.current})</h4>
      <ul>
        {processedData.slice(0, 5).map((item, index) => (
          <li key={index} onClick={() => onItemClick(data[index])}>
            Item {data[index]}: {item.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
});

// Demonstration of useCallback importance
const CallbackDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([1, 2, 3, 4, 5]);

  // Without useCallback - new function on every render
  const handleItemClickBad = (item: number) => {
    console.log(`Clicked item: ${item}`);
  };

  // With useCallback - stable function reference
  const handleItemClickGood = useCallback((item: number) => {
    console.log(`Clicked item: ${item}`);
  }, []);

  // Unstable config object
  const configBad = { multiplier: 2 };

  // Stable config object with useMemo
  const configGood = useMemo(() => ({ multiplier: 2 }), []);

  return (
    <div className="performance-demo">
      <div className="demo-section">
        <h4>Bad: Unstable Props</h4>
        <button className="btn" onClick={() => setCount(count + 1)}>
          Increment Count: {count}
        </button>
        <ExpensiveChildComponent 
          data={items} 
          onItemClick={handleItemClickBad}
          config={configBad}
        />
      </div>

      <div className="demo-section">
        <h4>Good: Stable Props</h4>
        <button className="btn" onClick={() => setCount(count + 1)}>
          Increment Count: {count}
        </button>
        <MemoizedChildComponent 
          data={items} 
          onItemClick={handleItemClickGood}
          config={configGood}
        />
      </div>
    </div>
  );
};

// useMemo vs regular calculation comparison
const UseMemoComparison: React.FC = () => {
  const [numbers, setNumbers] = useState<number[]>(() => 
    Array.from({ length: 1000 }, (_, i) => i + 1)
  );
  const [filter, setFilter] = useState(10);
  const [counter, setCounter] = useState(0);

  // Without useMemo - recalculates on every render
  const expensiveCalculationWithoutMemo = () => {
    console.log('Expensive calculation WITHOUT useMemo running...');
    return numbers
      .filter(n => n % filter === 0)
      .reduce((sum, n) => sum + Math.sqrt(n), 0);
  };

  // With useMemo - only recalculates when dependencies change
  const expensiveCalculationWithMemo = useMemo(() => {
    console.log('Expensive calculation WITH useMemo running...');
    return numbers
      .filter(n => n % filter === 0)
      .reduce((sum, n) => sum + Math.sqrt(n), 0);
  }, [numbers, filter]);

  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  const measureWithoutMemo = () => {
    const start = performance.now();
    const result = expensiveCalculationWithoutMemo();
    const end = performance.now();
    setStartTime(start);
    setEndTime(end);
    console.log(`Without useMemo: ${end - start}ms, Result: ${result}`);
  };

  const measureWithMemo = () => {
    const start = performance.now();
    const result = expensiveCalculationWithMemo;
    const end = performance.now();
    console.log(`With useMemo: ${end - start}ms, Result: ${result}`);
  };

  return (
    <div className="example-section">
      <h3>useMemo Performance Comparison</h3>
      
      <div className="controls">
        <button className="btn" onClick={() => setCounter(counter + 1)}>
          Trigger Re-render (Counter: {counter})
        </button>
        <button className="btn" onClick={() => setFilter(filter === 10 ? 5 : 10)}>
          Change Filter ({filter})
        </button>
        <button className="btn" onClick={measureWithoutMemo}>
          Measure Without useMemo
        </button>
        <button className="btn" onClick={measureWithMemo}>
          Measure With useMemo
        </button>
      </div>

      <div className="metrics">
        <div>Numbers array length: {numbers.length}</div>
        <div>Current filter: {filter}</div>
        <div>Counter (triggers re-render): {counter}</div>
        <div>Last measurement time: {endTime - startTime > 0 ? `${(endTime - startTime).toFixed(2)}ms` : 'Not measured'}</div>
      </div>

      <div className="warning">
        <strong>🔍 Observe the Console:</strong>
        <ul>
          <li>Without useMemo: Calculation runs on every re-render</li>
          <li>With useMemo: Calculation only runs when filter changes</li>
          <li>Counter increments don't trigger memoized calculation</li>
        </ul>
      </div>
    </div>
  );
};

const MemoizationExamples: React.FC = () => {
  return (
    <div className="example-page">
      <h2>🧠 Memoization: React.memo, useMemo, and useCallback</h2>
      
      <div className="example-section">
        <h3>Understanding Memoization</h3>
        <p>
          Memoization is an optimization technique that caches the results of expensive 
          operations and returns the cached result when the same inputs occur again.
        </p>
        
        <div className="code-block">
{`// React.memo - Prevents component re-renders
const MyComponent = React.memo(({ prop1, prop2 }) => {
  return <div>{prop1} {prop2}</div>;
});

// useMemo - Memoizes expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// useCallback - Memoizes function references
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);`}
        </div>
      </div>

      <UseMemoComparison />

      <div className="example-section">
        <h3>React.memo and useCallback Interaction</h3>
        <p>
          This example shows why useCallback is crucial when passing functions 
          to memoized components. Without useCallback, React.memo becomes ineffective.
        </p>
        <CallbackDemo />
      </div>

      <div className="example-section">
        <h3>Best Practices</h3>
        
        <div className="success">
          <strong>✅ When to Use Memoization:</strong>
          <ul>
            <li><strong>React.memo:</strong> Components that render often with same props</li>
            <li><strong>useMemo:</strong> Expensive calculations that depend on specific values</li>
            <li><strong>useCallback:</strong> Functions passed to memoized child components</li>
          </ul>
        </div>

        <div className="warning">
          <strong>⚠️ When NOT to Use Memoization:</strong>
          <ul>
            <li>Simple calculations (overhead may exceed benefits)</li>
            <li>Props that change frequently</li>
            <li>Components that rarely re-render</li>
            <li>Premature optimization without profiling</li>
          </ul>
        </div>

        <div className="error">
          <strong>❌ Common Mistakes:</strong>
          <ul>
            <li>Forgetting to memoize object/function props passed to React.memo components</li>
            <li>Using useMemo for simple string/number calculations</li>
            <li>Missing dependencies in dependency arrays</li>
            <li>Over-memoizing everything without measuring impact</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MemoizationExamples; 