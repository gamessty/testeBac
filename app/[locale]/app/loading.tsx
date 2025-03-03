import React from 'react';
import { Center, Loader } from '@mantine/core';
import FontSizeUpdater from '../../../components/FontSizeUpdater/FontSizeUpdater';

const Loading = () => {
    return (
            <Center style={{ height: '100%' }}>
                <Loader size="xl" color="gray" type="dots" />
            </Center>
    );
};

export default Loading;