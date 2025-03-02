import React from 'react';
import { Center, Loader } from '@mantine/core';
import FontSizeUpdater from '../../../components/FontSizeUpdater/FontSizeUpdater';

const Loading = () => {
    return (
            <Center style={{ height: '100vh' }}>
                <Loader size="xl" variant="bars" />
            </Center>
    );
};

export default Loading;