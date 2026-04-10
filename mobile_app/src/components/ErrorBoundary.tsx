import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>Algo deu errado.</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafb',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  message: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  button: {
    backgroundColor: '#005bbf',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
});
