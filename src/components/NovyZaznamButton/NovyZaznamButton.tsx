import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface NovyZaznamButtonProps {
  onPress: () => void;
  isVisible?: boolean;
  title?: string;
  isCollapsible?: boolean;
  isExpanded?: boolean;
  noMargin?: boolean;
}

/**
 * @description Nové jednotné tlačítko "Nový záznam" s moderním vzhledem
 */
export const NovyZaznamButton: React.FC<NovyZaznamButtonProps> = ({
  onPress,
  isVisible = true,
  title = "Nový záznam",
  isCollapsible = false,
  isExpanded = false,
  noMargin = false
}) => {
  if (!isVisible) return null;

  return (
    <TouchableOpacity 
      style={[styles.button, noMargin && styles.buttonNoMargin]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{title}</Text>
      {isCollapsible && (
        <Text style={styles.arrowIcon}>
          {isExpanded ? '▼' : '▶'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
  },
  arrowIcon: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: 'bold',
  },
  buttonNoMargin: {
    marginHorizontal: 0,
    marginTop: 0,
  },
});
