import React from 'react';
import Animation from './Animation';

function Landing() {
  return (
    <div style={styles.container}>
        <Animation/>
    </div>
  );
}

// Styles for the component
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100vh',
    position: 'relative',
  }
};

export default Landing;
