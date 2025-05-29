import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// Anti-pattern 1: Using useEffect for derived state
const DerivedStateAntiPattern: React.FC = () => {
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [fullName, setFullName] = useState('');

  // ❌ Anti-pattern: Using useEffect for derived state
  useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);

  return (
    <div className="demo-section">
      <h4>❌ Anti-pattern: useEffect for Derived State</h4>
      <input 
        value={firstName} 
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
      />
      <input 
        value={lastName} 
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
      />
      <p>Full Name: {fullName}</p>
      <div className="warning">
        This causes unnecessary re-renders: first render with old fullName, 
        then useEffect runs and triggers another render.
      </div>
    </div>
  );
};

const DerivedStateSolution: React.FC = () => {
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');

  // ✅ Solution: Calculate during render
  const fullName = `${firstName} ${lastName}`;

  return (
    <div className="demo-section">
      <h4>✅ Solution: Calculate During Render</h4>
      <input 
        value={firstName} 
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
      />
      <input 
        value={lastName} 
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
      />
      <p>Full Name: {fullName}</p>
      <div className="success">
        Single render cycle, no unnecessary state updates.
      </div>
    </div>
  );
};

// Anti-pattern 2: useEffect for event handling
const EventHandlingAntiPattern: React.FC = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  // ❌ Anti-pattern: Using useEffect to respond to state changes from user events
  useEffect(() => {
    if (count > 0) {
      setMessage(`Button clicked ${count} times!`);
    }
  }, [count]);

  const handleClick = () => {
    setCount(prev => prev + 1);
  };

  return (
    <div className="demo-section">
      <h4>❌ Anti-pattern: useEffect for Event Response</h4>
      <button className="btn" onClick={handleClick}>
        Click me ({count})
      </button>
      <p>{message}</p>
      <div className="warning">
        Logic is separated from the event that triggers it.
      </div>
    </div>
  );
};

const EventHandlingSolution: React.FC = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  // ✅ Solution: Handle logic directly in event handler
  const handleClick = () => {
    const newCount = count + 1;
    setCount(newCount);
    setMessage(`Button clicked ${newCount} times!`);
  };

  return (
    <div className="demo-section">
      <h4>✅ Solution: Logic in Event Handler</h4>
      <button className="btn" onClick={handleClick}>
        Click me ({count})
      </button>
      <p>{message}</p>
      <div className="success">
        Logic is co-located with the event that triggers it.
      </div>
    </div>
  );
};

// Missing dependency conundrum
const MissingDependencyProblem: React.FC = () => {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  const [result, setResult] = useState(0);

  // ❌ This will break when we add missing dependencies
  useEffect(() => {
    const timer = setInterval(() => {
      // This creates a stale closure if count/multiplier aren't in deps
      setResult(count * multiplier);
      console.log(`Timer: count=${count}, multiplier=${multiplier}, result=${count * multiplier}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [count, multiplier]); // Missing dependencies: count, multiplier

  return (
    <div className="demo-section">
      <h4>❌ Missing Dependencies Problem</h4>
      <div className="controls">
        <button className="btn" onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
        <button className="btn" onClick={() => setMultiplier(m => m + 1)}>
          Multiplier: {multiplier}
        </button>
      </div>
      <p>Result: {result}</p>
      <div className="error">
        Timer always uses initial values (stale closure). 
        Adding dependencies would restart timer on every change.
      </div>
    </div>
  );
};

const MissingDependencySolution: React.FC = () => {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  const [result, setResult] = useState(0);

  // ✅ Solution: Use functional updates to avoid dependencies
  useEffect(() => {
    const timer = setInterval(() => {
      setResult(prevResult => {
        // Get current values without depending on them
        setCount(currentCount => {
          setMultiplier(currentMultiplier => {
            const newResult = currentCount * currentMultiplier;
            console.log(`Timer: count=${currentCount}, multiplier=${currentMultiplier}, result=${newResult}`);
            setResult(newResult);
            return currentMultiplier;
          });
          return currentCount;
        });
        return prevResult;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []); // No dependencies needed

  // Alternative solution using useRef
  const countRef = useRef(count);
  const multiplierRef = useRef(multiplier);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  useEffect(() => {
    multiplierRef.current = multiplier;
  }, [multiplier]);

  return (
    <div className="demo-section">
      <h4>✅ Solution: Functional Updates or useRef</h4>
      <div className="controls">
        <button className="btn" onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
        <button className="btn" onClick={() => setMultiplier(m => m + 1)}>
          Multiplier: {multiplier}
        </button>
      </div>
      <p>Result: {result}</p>
      <div className="success">
        Timer accesses current values without causing restarts.
      </div>
    </div>
  );
};

// Unstable dependencies example
const UnstableDependencies: React.FC = () => {
  const [data, setData] = useState([1, 2, 3]);
  const [renderCount, setRenderCount] = useState(0);

  // ❌ Unstable object dependency
  const options = { threshold: 0.5, multiplier: 2 };

  useEffect(() => {
    console.log('Effect with unstable dependency running...');
    setRenderCount(prev => prev + 1);
  }, [options]); // This will run on every render!

  return (
    <div className="demo-section">
      <h4>❌ Unstable Dependencies</h4>
      <button className="btn" onClick={() => setData([...data, data.length + 1])}>
        Add Item
      </button>
      <p>Effect runs: {renderCount} times</p>
      <div className="error">
        Effect runs on every render because options object is recreated.
      </div>
    </div>
  );
};

const StableDependencies: React.FC = () => {
  const [data, setData] = useState([1, 2, 3]);
  const [renderCount, setRenderCount] = useState(0);

  // ✅ Stable object dependency
  const options = useMemo(() => ({ 
    threshold: 0.5, 
    multiplier: 2 
  }), []);

  useEffect(() => {
    console.log('Effect with stable dependency running...');
    setRenderCount(prev => prev + 1);
  }, [options]); // This will only run once!

  return (
    <div className="demo-section">
      <h4>✅ Stable Dependencies</h4>
      <button className="btn" onClick={() => setData([...data, data.length + 1])}>
        Add Item
      </button>
      <p>Effect runs: {renderCount} times</p>
      <div className="success">
        Effect only runs once because options object is memoized.
      </div>
    </div>
  );
};

// Infinite loop example
const InfiniteLoopExample: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const startInfiniteLoop = () => {
    setIsRunning(true);
    // This would create an infinite loop if count was in dependencies
    // useEffect(() => {
    //   setCount(count + 1);
    // }, [count]);
  };

  const stopInfiniteLoop = () => {
    setIsRunning(false);
  };

  // Safe version
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setCount(prevCount => prevCount + 1); // Functional update avoids dependency
    }, 100);

    return () => clearInterval(timer);
  }, [isRunning]); // Only depends on isRunning, not count

  return (
    <div className="demo-section">
      <h4>Avoiding Infinite Loops</h4>
      <div className="controls">
        <button className="btn" onClick={startInfiniteLoop} disabled={isRunning}>
          Start Counter
        </button>
        <button className="btn" onClick={stopInfiniteLoop} disabled={!isRunning}>
          Stop Counter
        </button>
      </div>
      <p>Count: {count}</p>
      <div className="success">
        Uses functional update to avoid infinite loop.
      </div>
    </div>
  );
};

const UseEffectAntiPatterns: React.FC = () => {
  return (
    <div className="example-page">
      <h2>⚠️ useEffect Anti-patterns and Solutions</h2>
      
      <div className="example-section">
        <h3>Understanding useEffect Purpose</h3>
        <p>
          useEffect is for synchronizing with external systems, not for transforming 
          data for rendering or handling user events. Many performance issues stem 
          from misusing useEffect.
        </p>
        
        <div className="warning">
          <strong>🎯 useEffect Mental Model:</strong>
          <br />
          Think "synchronization" not "lifecycle". Ask: "What external system 
          does this component need to stay synchronized with?"
        </div>
      </div>

      <div className="example-section">
        <h3>1. Derived State Anti-pattern</h3>
        <div className="performance-demo">
          <DerivedStateAntiPattern />
          <DerivedStateSolution />
        </div>
      </div>

      <div className="example-section">
        <h3>2. Event Handling Anti-pattern</h3>
        <div className="performance-demo">
          <EventHandlingAntiPattern />
          <EventHandlingSolution />
        </div>
      </div>

      <div className="example-section">
        <h3>3. Missing Dependencies Conundrum</h3>
        <p>
          When adding missing dependencies breaks your effect, the problem is usually 
          with the effect's logic, not the dependency rule.
        </p>
        <div className="performance-demo">
          <MissingDependencyProblem />
          <MissingDependencySolution />
        </div>
      </div>

      <div className="example-section">
        <h3>4. Unstable Dependencies</h3>
        <div className="performance-demo">
          <UnstableDependencies />
          <StableDependencies />
        </div>
      </div>

      <div className="example-section">
        <h3>5. Infinite Loops</h3>
        <InfiniteLoopExample />
      </div>

      <div className="example-section">
        <h3>Refactoring Strategies</h3>
        
        <div className="code-block">
{`// ❌ Common anti-patterns
useEffect(() => {
  setDerivedState(computeFromProps(props));
}, [props]); // Derived state

useEffect(() => {
  if (userClicked) {
    doSomething();
  }
}, [userClicked]); // Event handling

useEffect(() => {
  setCount(count + 1);
}, [count]); // Infinite loop

// ✅ Better approaches
const derivedState = computeFromProps(props); // Direct calculation

const handleClick = () => {
  setUserClicked(true);
  doSomething(); // Direct in handler
};

const increment = () => {
  setCount(prev => prev + 1); // Functional update
};`}
        </div>

        <div className="success">
          <strong>✅ Refactoring Guidelines:</strong>
          <ul>
            <li><strong>Stabilize Dependencies:</strong> Use useMemo/useCallback for objects/functions</li>
            <li><strong>Functional Updates:</strong> Use setter functions to avoid state dependencies</li>
            <li><strong>useRef for Latest Values:</strong> Access current values without dependencies</li>
            <li><strong>Split Effects:</strong> Separate concerns into focused effects</li>
            <li><strong>Question the Need:</strong> Often useEffect isn't needed at all</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UseEffectAntiPatterns; 