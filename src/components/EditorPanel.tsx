import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface EditorPanelProps {
  selectedElement: {
    tagName: string;
    className: string;
    text: string;
    styles: {
      padding: string;
      margin: string;
      backgroundColor: string;
      color: string;
      fontSize: string;
    };
  } | null;
  onUpdate: (update: any) => void;
  onClose: () => void;
}

const EditorPanel = ({ selectedElement, onUpdate, onClose }: EditorPanelProps) => {
  const [values, setValues] = useState(selectedElement);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setValues(selectedElement);
    if (selectedElement) {
      // Trigger slide-in after mounting
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [selectedElement]);

  if (!selectedElement || !values) return null;

  const handleChange = (field: string, value: string) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    onUpdate({ [field]: value });
  };

  const handleStyleChange = (styleName: string, value: string) => {
    const newStyles = { ...values.styles, [styleName]: value };
    const newValues = { ...values, styles: newStyles };
    setValues(newValues);
    onUpdate({ styles: { [styleName]: value } });
  };

  return (
    <div
      className={`
        absolute top-4 right-4 bottom-4 w-96 bg-white border border-gray-300 rounded-xl shadow-lg p-4 z-50 flex flex-col
        transform transition-transform duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-700">Edit Element</h3>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // wait for slide-out
          }}
          className="text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Text */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Text Content</label>
          <textarea
            value={values.text}
            onChange={(e) => handleChange('text', e.target.value)}
            className="border border-gray-300 rounded p-2 w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Class Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Class Name</label>
          <input
            type="text"
            value={values.className || ''}
            onChange={(e) => handleChange('className', e.target.value)}
            className="border border-gray-300 rounded p-2 w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Styles: Padding, Margin, FontSize */}
        {['padding', 'margin', 'fontSize'].map((style) => (
          <div key={style} className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">{style}</label>
            <input
              type="text"
              value={(values.styles as any)[style]}
              onChange={(e) => handleStyleChange(style, e.target.value)}
              className="border border-gray-300 rounded p-2 w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}

        {/* Color Pickers */}
        {['backgroundColor', 'color'].map((style) => (
          <div key={style} className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">{style}</label>
            <input
              type="color"
              value={(values.styles as any)[style] || '#000000'}
              onChange={(e) => handleStyleChange(style, e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-700">{(values.styles as any)[style]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorPanel;
