import { JSX, ParentComponent, createSignal } from 'solid-js';

type FlexAlignment = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
type FlexJustification = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

interface StackProps {
  width?: string;
  height?: string;
  maxwidth?: string;
  minWidth?: string;
  gap?: string;
  alignItems?: FlexAlignment;
  justify?: FlexJustification;
  padding?: string;
  margin?: string;
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

export const HStack: ParentComponent<StackProps> = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        "flex-direction": 'row',
        width: props.width,
        "max-width": props.maxwidth,
        height: props.height,
        gap: props.gap,
        "align-items": props.alignItems,
        "justify-content": props.justify,
        padding: props.padding,
        margin: props.margin,
        "flex-wrap": props.wrap,
      }}
    >
      {props.children}
    </div>
  );
};

export const VStack: ParentComponent<StackProps> = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        "flex-direction": 'column',
        width: props.width,
        "max-width": props.maxwidth,
        "min-width": props.minWidth,
        height: props.height,
        gap: props.gap,
        "align-items": props.alignItems,
        "justify-content": props.justify,
        padding: props.padding,
        margin: props.margin,
        "flex-wrap": props.wrap,
      }}
    >
      {props.children}
    </div>
  );
};


interface CardProps {
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  onClick?: () => void;
}

export const Card: ParentComponent<CardProps> = (props) => {
  return (
    <div
      style={{
        width: props.width || 'auto',
        height: props.height || 'auto',
        padding: props.padding || '16px',
        margin: props.margin || '0',
        "background-color": props.backgroundColor || 'white',
        "border-radius": props.borderRadius || '8px',
        "box-shadow": props.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: props.onClick ? 'pointer' : 'default',
      }}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
};

interface InputFormProps {
  onSubmit: (value: string) => void;
  onInput?: (value: string) => void;
  placeholder?: string;
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  width?: string;
  maxwidth?: string;
  height?: string;
  gap?: string;
  clearOnSubmit?: boolean;
}

export const InputForm: ParentComponent<InputFormProps> = (props) => {
  const [inputValue, setInputValue] = createSignal('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    props.onSubmit(inputValue());
    if (props.clearOnSubmit) {
      setInputValue('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div style={{
      "width": props.width || "100%",
      "max-width": props.maxwidth || "100%",
      "margin": "0 auto",
      "padding": "0",
      "box-sizing": "border-box"
    }}>
      <form onSubmit={handleSubmit}>
        <HStack gap={props.gap || '10px'} width='100%' height={props.height || 'auto'}>
          <input
            type="text"
            value={inputValue()}
            onInput={(e) => setInputValue(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            placeholder={props.placeholder || ''}
            style={{
              "flex-grow": "1",
              "padding": "8px",
              "border": "1px solid #ccc",
              "border-radius": "4px 0 0 4px",
            }}
          />
          <button
            type="submit"
            style={{
              "padding": "8px 16px",
              "background-color": props.buttonColor || "#007bff",
              "color": props.buttonTextColor || "white",
              "border": "none",
              "border-radius": "0 4px 4px 0",
              "cursor": "pointer",
            }}
          >
            {props.buttonText || '確定'}
          </button>
        </HStack>
      </form>
    </div>
  );
};
