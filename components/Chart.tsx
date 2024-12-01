import { StyleSheet, View } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

type DataPoint = {
  x: number;
  y: number;
};

type Props = {
  data: DataPoint[];
  width: number;
  height: number;
  title?: string;
};

export function Chart({ data, width, height, title }: Props) {
  const textColor = useThemeColor({}, 'text');
  
  // Calculate the scaling factors
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // Find min/max values
  const minX = Math.min(...data.map(p => p.x));
  const maxX = Math.max(...data.map(p => p.x));
  const minY = Math.min(...data.map(p => p.y));
  const maxY = Math.max(...data.map(p => p.y));
  
  // Create scaling functions
  const scaleX = (x: number) => {
    return padding + ((x - minX) / (maxX - minX)) * chartWidth;
  };
  
  const scaleY = (y: number) => {
    return height - (padding + ((y - minY) / (maxY - minY)) * chartHeight);
  };
  
  // Create the path data
  const pathData = data
    .map((point, index) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <View style={styles.container}>
      {title && <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>}
      <Svg width={width} height={height}>
        {/* Y-axis */}
        <Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke={textColor}
          strokeWidth="1"
        />
        
        {/* X-axis */}
        <Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke={textColor}
          strokeWidth="1"
        />
        
        {/* Data line */}
        <Path
          d={pathData}
          fill="none"
          stroke="#0a7ea4"
          strokeWidth="2"
        />
        
        {/* Axis labels */}
        <SvgText
          x={width / 2}
          y={height - 10}
          fill={textColor}
          textAnchor="middle"
          fontSize="12"
        >
          X Axis
        </SvgText>
        
        <SvgText
          x={15}
          y={height / 2}
          fill={textColor}
          textAnchor="middle"
          fontSize="12"
          rotation="-90"
        >
          Y Axis
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
});
