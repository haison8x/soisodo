import React from 'react';
import { View, StyleSheet } from 'react-native';
import CoordinateRow from './CoordinateRow';
import { useTheme } from '../../theme/ThemeProvider';
import type { Coordinate } from '../../types';

interface CoordinatesListProps {
  coordinates: Coordinate[];
  isEditMode: boolean;
  newX: string;
  newY: string;
  onUpdateCoordinate: (id: string, field: 'x' | 'y', value: string) => void;
  onDeleteCoordinate: (id: string) => void;
  onNewXChange: (val: string) => void;
  onNewYChange: (val: string) => void;
  onAddCoordinate: () => void;
}

const CoordinatesList = ({
  coordinates,
  isEditMode,
  newX,
  newY,
  onUpdateCoordinate,
  onDeleteCoordinate,
  onNewXChange,
  onNewYChange,
  onAddCoordinate,
}: CoordinatesListProps) => {
  const t = useTheme();

  return (
    <View style={[styles.cardNoPad, t.shadow.sm, { backgroundColor: t.colors.surface }]}>
      {coordinates.map((coord, index) => (
        <React.Fragment key={coord.id}>
          <CoordinateRow
            index={index}
            x={coord.x}
            y={coord.y}
            isEditMode={isEditMode}
            onChangeX={val => onUpdateCoordinate(coord.id, 'x', val)}
            onChangeY={val => onUpdateCoordinate(coord.id, 'y', val)}
            onDelete={() => onDeleteCoordinate(coord.id)}
          />
          <View style={[styles.rowSep, { backgroundColor: t.colors.separator, marginLeft: isEditMode ? 54 : 16 }]} />
        </React.Fragment>
      ))}
      <CoordinateRow
        index={coordinates.length}
        x={newX}
        y={newY}
        onChangeX={onNewXChange}
        onChangeY={onNewYChange}
        onAdd={onAddCoordinate}
        isNew
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardNoPad: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  rowSep: {
    height: StyleSheet.hairlineWidth,
    marginRight: 16,
  },
});

export default CoordinatesList;
