import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';

// Generate complex table data
const generateTableData = (rows: number) => {
  return Array.from({ length: rows }, (_, index) => ({
    id: index,
    name: `Product ${index}`,
    category: ['Electronics', 'Books', 'Clothing', 'Home', 'Sports'][index % 5],
    price: Math.floor(Math.random() * 1000) + 10,
    quantity: Math.floor(Math.random() * 100) + 1,
    rating: (Math.random() * 5).toFixed(1),
    description: `This is a detailed description for product ${index}`,
    inStock: Math.random() > 0.2,
    discount: Math.floor(Math.random() * 50),
    tags: ['tag1', 'tag2', 'tag3'].slice(0, Math.floor(Math.random() * 3) + 1),
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }));
};

// Expensive calculation function
const calculateComplexMetrics = (item: any) => {
  let result = 0;
  // Simulate expensive calculation
  for (let i = 0; i < 1000; i++) {
    result += Math.sqrt(item.price * item.quantity * (i + 1));
  }
  return {
    totalValue: item.price * item.quantity,
    complexScore: result / 1000,
    profitMargin: ((item.price - (item.price * 0.7)) / item.price * 100).toFixed(1),
    efficiency: (item.rating * item.quantity / item.price).toFixed(2),
  };
};

// Non-optimized table row
const SlowTableRow: React.FC<{ item: any; index: number }> = ({ item, index }) => {
  console.log(`Rendering slow row ${index}`);
  
  // Expensive calculation on every render
  const metrics = calculateComplexMetrics(item);
  
  return (
    <tr style={{ backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent' }}>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {item.name}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {item.category}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        ${item.price}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {item.quantity}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        ${metrics.totalValue}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {metrics.complexScore.toFixed(2)}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {metrics.profitMargin}%
      </td>
    </tr>
  );
};

// Optimized table row with memoization
const OptimizedTableRow = React.memo<{ item: any; index: number }>(({ item, index }) => {
  console.log(`Rendering optimized row ${index}`);
  
  // Memoized expensive calculation
  const metrics = useMemo(() => calculateComplexMetrics(item), [item]);
  
  return (
    <tr style={{ backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent' }}>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {item.name}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {item.category}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        ${item.price}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {item.quantity}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        ${metrics.totalValue}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {metrics.complexScore.toFixed(2)}
      </td>
      <td style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {metrics.profitMargin}%
      </td>
    </tr>
  );
});

// Virtualized table row
const VirtualizedTableRow: React.FC<{ index: number; style: any; data: any }> = ({ 
  index, 
  style, 
  data 
}) => {
  const { items, columns } = data;
  const item = items[index];
  
  const metrics = useMemo(() => calculateComplexMetrics(item), [item]);
  
  return (
    <div style={{ ...style, display: 'flex', alignItems: 'center' }}>
      <div style={{ 
        width: '100%', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        padding: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
      }}>
        <div>{item.name}</div>
        <div>{item.category}</div>
        <div>${item.price}</div>
        <div>{item.quantity}</div>
        <div>${metrics.totalValue}</div>
        <div>{metrics.complexScore.toFixed(2)}</div>
        <div>{metrics.profitMargin}%</div>
      </div>
    </div>
  );
};

// Regular table component
const RegularTable: React.FC<{ data: any[]; optimized: boolean }> = ({ data, optimized }) => {
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    const endTime = performance.now();
    console.log(`${optimized ? 'Optimized' : 'Slow'} table render time: ${(endTime - startTime.current).toFixed(2)}ms`);
  });

  return (
    <div style={{ height: '400px', overflow: 'auto', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <tr>
            <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffd700', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffd700', textAlign: 'left' }}>Category</th>
            <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffd700', textAlign: 'left' }}>Price</th>
            <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffd700', textAlign: 'left' }}>Quantity</th>
            <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffd700', textAlign: 'left' }}>Total Value</th>
            <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffd700', textAlign: 'left' }}>Complex Score</th>
            <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffd700', textAlign: 'left' }}>Profit %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => 
            optimized ? (
              <OptimizedTableRow key={item.id} item={item} index={index} />
            ) : (
              <SlowTableRow key={item.id} item={item} index={index} />
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

// Virtualized table component
const VirtualizedTable: React.FC<{ data: any[] }> = ({ data }) => {
  const columns = ['Name', 'Category', 'Price', 'Quantity', 'Total Value', 'Complex Score', 'Profit %'];
  
  return (
    <div style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}>
      {/* Header */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        padding: '12px 8px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderBottom: '2px solid #ffd700',
        fontWeight: 'bold'
      }}>
        {columns.map(col => <div key={col}>{col}</div>)}
      </div>
      
      {/* Virtualized rows */}
      <List
        height={400}
        width="100%"
        itemCount={data.length}
        itemSize={50}
        itemData={{ items: data, columns }}
      >
        {VirtualizedTableRow}
      </List>
    </div>
  );
};

// Filtering and sorting functionality
const useTableFilters = (data: any[]) => {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (filters.category) {
      result = result.filter(item => item.category === filters.category);
    }
    if (filters.minPrice) {
      result = result.filter(item => item.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(item => item.price <= parseInt(filters.maxPrice));
    }
    if (filters.inStock) {
      result = result.filter(item => item.inStock);
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, sortConfig]);

  return {
    filteredAndSortedData,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
  };
};

const HeavyTableExample: React.FC = () => {
  const [dataSize, setDataSize] = useState(1000);
  const [tableType, setTableType] = useState<'slow' | 'optimized' | 'virtualized'>('slow');
  const [renderTime, setRenderTime] = useState(0);

  // Generate stable data
  const rawData = useMemo(() => {
    console.log(`Generating ${dataSize} table rows...`);
    return generateTableData(dataSize);
  }, [dataSize]);

  const {
    filteredAndSortedData,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
  } = useTableFilters(rawData);

  // Measure render performance
  const measureRender = useCallback(() => {
    const startTime = performance.now();
    setTimeout(() => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
    }, 0);
  }, []);

  useEffect(() => {
    measureRender();
  }, [tableType, filteredAndSortedData, measureRender]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, [setSortConfig]);

  return (
    <div className="example-page">
      <h2>📊 Heavy Table Optimization</h2>
      
      <div className="example-section">
        <h3>Optimizing Complex Data Tables</h3>
        <p>
          Large tables with complex calculations can severely impact performance. 
          This example demonstrates various optimization strategies for handling 
          thousands of rows with computationally intensive operations.
        </p>
      </div>

      <div className="example-section">
        <h3>Table Configuration</h3>
        
        <div className="controls">
          <button 
            className="btn" 
            onClick={() => setDataSize(100)}
          >
            100 Rows
          </button>
          <button 
            className="btn" 
            onClick={() => setDataSize(1000)}
          >
            1,000 Rows
          </button>
          <button 
            className="btn" 
            onClick={() => setDataSize(5000)}
          >
            5,000 Rows
          </button>
          <button 
            className="btn" 
            onClick={() => setDataSize(10000)}
          >
            10,000 Rows
          </button>
        </div>

        <div className="controls">
          <button 
            className="btn" 
            onClick={() => setTableType('slow')}
            style={{ backgroundColor: tableType === 'slow' ? '#dc3545' : undefined }}
          >
            ❌ Slow Table
          </button>
          <button 
            className="btn" 
            onClick={() => setTableType('optimized')}
            style={{ backgroundColor: tableType === 'optimized' ? '#ffc107' : undefined }}
          >
            ⚡ Optimized Table
          </button>
          <button 
            className="btn" 
            onClick={() => setTableType('virtualized')}
            style={{ backgroundColor: tableType === 'virtualized' ? '#28a745' : undefined }}
          >
            🚀 Virtualized Table
          </button>
        </div>

        <div className="metrics">
          <div><strong>Data Size:</strong> {dataSize.toLocaleString()} rows</div>
          <div><strong>Filtered Rows:</strong> {filteredAndSortedData.length.toLocaleString()}</div>
          <div><strong>Table Type:</strong> {tableType}</div>
          <div><strong>Render Time:</strong> {renderTime.toFixed(2)}ms</div>
        </div>
      </div>

      <div className="example-section">
        <h3>Filters and Sorting</h3>
        
        <div className="controls">
          <select 
            value={filters.category} 
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            style={{ padding: '8px', marginRight: '10px' }}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home</option>
            <option value="Sports">Sports</option>
          </select>
          
          <input 
            type="number" 
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
            style={{ padding: '8px', marginRight: '10px', width: '100px' }}
          />
          
          <input 
            type="number" 
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
            style={{ padding: '8px', marginRight: '10px', width: '100px' }}
          />
          
          <label style={{ marginRight: '10px' }}>
            <input 
              type="checkbox" 
              checked={filters.inStock}
              onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
              style={{ marginRight: '5px' }}
            />
            In Stock Only
          </label>
        </div>
      </div>

      <div className="performance-demo">
        <div className="demo-section" style={{ flex: 1 }}>
          <h4>
            {tableType === 'slow' && '❌ Slow Table (No Optimization)'}
            {tableType === 'optimized' && '⚡ Optimized Table (React.memo + useMemo)'}
            {tableType === 'virtualized' && '🚀 Virtualized Table (react-window)'}
          </h4>
          
          {tableType === 'virtualized' ? (
            <VirtualizedTable data={filteredAndSortedData} />
          ) : (
            <RegularTable 
              data={filteredAndSortedData} 
              optimized={tableType === 'optimized'} 
            />
          )}
        </div>
      </div>

      <div className="example-section">
        <h3>Optimization Strategies</h3>
        
        <div className="code-block">
{`// 1. Memoized row component
const OptimizedTableRow = React.memo(({ item, index }) => {
  const metrics = useMemo(() => calculateComplexMetrics(item), [item]);
  return <tr>...</tr>;
});

// 2. Stable data references
const data = useMemo(() => generateTableData(size), [size]);

// 3. Virtualization for large datasets
<List
  height={400}
  itemCount={data.length}
  itemSize={50}
  itemData={data}
>
  {VirtualizedTableRow}
</List>`}
        </div>

        <div className="success">
          <strong>✅ Table Optimization Techniques:</strong>
          <ul>
            <li><strong>React.memo:</strong> Prevent unnecessary row re-renders</li>
            <li><strong>useMemo:</strong> Cache expensive calculations per row</li>
            <li><strong>Virtualization:</strong> Render only visible rows</li>
            <li><strong>Stable Data:</strong> Memoize data transformations</li>
            <li><strong>Pagination:</strong> Limit rows per page</li>
            <li><strong>Server-side Operations:</strong> Move filtering/sorting to backend</li>
          </ul>
        </div>

        <div className="warning">
          <strong>⚠️ Performance Considerations:</strong>
          <ul>
            <li><strong>Cell Complexity:</strong> Keep cell renderers simple</li>
            <li><strong>Data Stability:</strong> Avoid recreating data objects</li>
            <li><strong>Event Handlers:</strong> Use useCallback for stable references</li>
            <li><strong>Column Sizing:</strong> Fixed widths perform better than auto-sizing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HeavyTableExample; 