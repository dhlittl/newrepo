// app/pages/sponsor/catalog/components/CatalogTabs.jsx
'use client';

const CatalogTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'catalog', label: 'My Catalog' },
    { id: 'itunes', label: 'Add from iTunes' },
    { id: 'add-manual', label: 'Add Item Manually' }
  ];
  
  return (
    <div className="flex border-b mb-6">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          className={`px-4 py-2 ${activeTab === tab.id ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CatalogTabs;