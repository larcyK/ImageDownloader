import type { Component } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';
import ImageFetcher from './ImageFetcher';
import { VStack } from './CommonTool';

const App: Component = () => {
  return (
    <VStack>
      <main>
        <ImageFetcher />
      </main>
    </VStack>
  );
};

export default App;
