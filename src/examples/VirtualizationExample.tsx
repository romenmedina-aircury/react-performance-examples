import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

// Generate large dataset
const generateLargeDataset = (size: number) => {
  return Array.from({ length: size }, (_, index) => ({
    id: index,
    name: `Item ${index}`,
    description: `This is a description for item ${index}`,
    value: Math.floor(Math.random() * 1000),
    category: ['Electronics', 'Books', 'Clothing', 'Home'][index % 4],
    timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }));
};

// Regular list item component (non-virtualized)
const RegularListItem: React.FC<{ item: any; index: number }> = ({ item, index }) => {
  return (
    <div 
      style={{
        padding: '10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
      }}
    >
      <div style={{ fontWeight: 'bold', color: '#ffd700' }}>{item.name}</div>
      <div style={{ fontSize: '0.9em', opacity: 0.8 }}>{item.description}</div>
      <div style={{ fontSize: '0.8em', opacity: 0.6 }}>
        Value: ${item.value} | Category: {item.category}
      </div>
    </div>
  );
};

// Virtualized list item component
const VirtualizedListItem: React.FC<{ index: number; style: any; data: any[] }> = ({ 
  index, 
  style, 
  data 
}) => {
  const item = data[index];
  
  return (
    <div style={style}>
      <div 
        style={{
          padding: '10px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontWeight: 'bold', color: '#ffd700' }}>{item.name}</div>
        <div style={{ fontSize: '0.9em', opacity: 0.8 }}>{item.description}</div>
        <div style={{ fontSize: '0.8em', opacity: 0.6 }}>
          Value: ${item.value} | Category: {item.category}
        </div>
      </div>
    </div>
  );
};

// Regular (non-virtualized) list component
const RegularList: React.FC<{ data: any[]; height: number }> = ({ data, height }) => {
  const startTime = performance.now();
  
  const listContent = (
    <div style={{ height, overflow: 'auto', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
      {data.map((item, index) => (
        <RegularListItem key={item.id} item={item} index={index} />
      ))}
    </div>
  );
  
  const endTime = performance.now();
  console.log(`Regular list render time: ${(endTime - startTime).toFixed(2)}ms`);
  
  return listContent;
};

// Virtualized list component
const VirtualizedList: React.FC<{ data: any[]; height: number }> = ({ data, height }) => {
  const startTime = performance.now();
  
  const listContent = (
    <List
      height={height}
      width="100%"
      itemCount={data.length}
      itemSize={80}
      itemData={data}
      style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
    >
      {VirtualizedListItem}
    </List>
  );
  
  const endTime = performance.now();
  console.log(`Virtualized list render time: ${(endTime - startTime).toFixed(2)}ms`);
  
  return listContent;
};

// Performance metrics component
const PerformanceMetrics: React.FC<{ 
  dataSize: number; 
  showVirtualized: boolean;
  renderTime: number;
}> = ({ dataSize, showVirtualized, renderTime }) => {
  const estimatedDOMNodes = showVirtualized ? Math.ceil(400 / 80) : dataSize; // 400px height / 80px item height
  const memoryUsage = showVirtualized ? estimatedDOMNodes * 0.1 : dataSize * 0.1; // Rough estimate
  
  return (
    <div className="metrics">
      <div><strong>Data Size:</strong> {dataSize.toLocaleString()} items</div>
      <div><strong>List Type:</strong> {showVirtualized ? 'Virtualized' : 'Regular'}</div>
      <div><strong>Estimated DOM Nodes:</strong> {estimatedDOMNodes.toLocaleString()}</div>
      <div><strong>Estimated Memory:</strong> {memoryUsage.toFixed(1)} KB</div>
      <div><strong>Last Render Time:</strong> {renderTime.toFixed(2)}ms</div>
    </div>
  );
};

const VirtualizationExample: React.FC = () => {
  const [dataSize, setDataSize] = useState(1000);
  const [showVirtualized, setShowVirtualized] = useState(false);
  const [renderTime, setRenderTime] = useState(0);
  const [isRendering, setIsRendering] = useState(false);

  // Generate data based on size
  const data = useMemo(() => {
    console.log(`Generating ${dataSize} items...`);
    return generateLargeDataset(dataSize);
  }, [dataSize]);

  // Measure render performance
  const measureRender = useCallback(() => {
    setIsRendering(true);
    const startTime = performance.now();
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
      setIsRendering(false);
    }, 0);
  }, []);

  const handleDataSizeChange = (newSize: number) => {
    setDataSize(newSize);
    measureRender();
  };

  const toggleVirtualization = () => {
    setShowVirtualized(!showVirtualized);
    measureRender();
  };

  const listHeight = 400;

  return (
    <div className="example-page">
      <h2>📜 Virtualization with react-window</h2>
      
      <div className="example-section">
        <h3>Understanding Virtualization</h3>
        <p>
          Virtualization (windowing) renders only the visible items in a list, 
          dramatically improving performance for large datasets by reducing DOM nodes 
          and memory usage.
        </p>
        
        <div className="success">
          <strong>✅ Benefits of Virtualization:</strong>
          <ul>
            <li><strong>Reduced DOM Nodes:</strong> Only visible items are rendered</li>
            <li><strong>Lower Memory Usage:</strong> Constant memory regardless of list size</li>
            <li><strong>Faster Initial Render:</strong> Only renders what's visible</li>
            <li><strong>Smooth Scrolling:</strong> Maintains 60fps even with huge lists</li>
          </ul>
        </div>
      </div>

      <div className="example-section">
        <h3>Performance Comparison</h3>
        
        <div className="controls">
          <button 
            className="btn" 
            onClick={() => handleDataSizeChange(100)}
            disabled={isRendering}
          >
            100 Items
          </button>
          <button 
            className="btn" 
            onClick={() => handleDataSizeChange(1000)}
            disabled={isRendering}
          >
            1,000 Items
          </button>
          <button 
            className="btn" 
            onClick={() => handleDataSizeChange(10000)}
            disabled={isRendering}
          >
            10,000 Items
          </button>
          <button 
            className="btn" 
            onClick={() => handleDataSizeChange(100000)}
            disabled={isRendering}
          >
            100,000 Items
          </button>
          <button 
            className="btn" 
            onClick={toggleVirtualization}
            style={{ 
              backgroundColor: showVirtualized ? '#28a745' : '#dc3545',
              marginLeft: '20px'
            }}
            disabled={isRendering}
          >
            {showVirtualized ? 'Show Regular List' : 'Show Virtualized List'}
          </button>
        </div>

        <PerformanceMetrics 
          dataSize={dataSize}
          showVirtualized={showVirtualized}
          renderTime={renderTime}
        />

        {isRendering && (
          <div className="warning">
            <strong>⏳ Rendering...</strong> Measuring performance...
          </div>
        )}
      </div>

      <div className="performance-demo">
        <div className="demo-section" style={{ flex: 1 }}>
          <h4>
            {showVirtualized ? '✅ Virtualized List' : '❌ Regular List'} 
            ({dataSize.toLocaleString()} items)
          </h4>
          
          {showVirtualized ? (
            <VirtualizedList data={data} height={listHeight} />
          ) : (
            <RegularList data={data} height={listHeight} />
          )}
        </div>
      </div>

      <div className="example-section">
        <h3>Implementation Details</h3>
        
        <div className="code-block">
{`// react-window FixedSizeList
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ data, height }) => (
  <List
    height={height}        // Container height
    itemCount={data.length} // Total number of items
    itemSize={80}          // Height of each item
    itemData={data}        // Data to pass to items
  >
    {VirtualizedListItem}
  </List>
);

// Item renderer receives index, style, and data
const VirtualizedListItem = ({ index, style, data }) => (
  <div style={style}>
    <div>{data[index].name}</div>
  </div>
);`}
        </div>

        <div className="warning">
          <strong>⚠️ When to Use Virtualization:</strong>
          <ul>
            <li>Lists with hundreds or thousands of items</li>
            <li>Items with consistent or predictable sizes</li>
            <li>Performance issues with scrolling or initial render</li>
            <li>Memory constraints on lower-end devices</li>
          </ul>
        </div>

        <div className="error">
          <strong>❌ Virtualization Limitations:</strong>
          <ul>
            <li>Items must have known/fixed sizes (or use VariableSizeList)</li>
            <li>Accessibility features may be limited</li>
            <li>Search/find functionality needs special handling</li>
            <li>Some CSS features (like sticky positioning) don't work</li>
          </ul>
        </div>
      </div>

      <div className="example-section">
        <h3>Performance Tips</h3>
        
        <div className="success">
          <strong>🚀 Optimization Strategies:</strong>
          <ul>
            <li><strong>Memoize Item Components:</strong> Use React.memo for list items</li>
            <li><strong>Stable Item Data:</strong> Avoid recreating data objects</li>
            <li><strong>Overscan:</strong> Render extra items outside viewport for smooth scrolling</li>
            <li><strong>Variable Sizes:</strong> Use VariableSizeList for dynamic item heights</li>
            <li><strong>Horizontal Lists:</strong> Use FixedSizeList with layout="horizontal"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VirtualizationExample; 