import styles from "./TestProgressBar.module.css";
import { DefaultMantineColor, MantineRadius, MantineSize, Progress, Skeleton, Tooltip } from "@mantine/core";

export default function TestProgressBar({ value, size, labels, color }: Readonly<{ labels: { rest?: { tooltip?: string, root?: string }, filled?: { tooltip?: string, root?: string } }, color?: DefaultMantineColor, value?: number, size?: number | MantineSize, radius?: MantineRadius }>) {

    if (typeof value === 'undefined' || value < 0 || value > 100) {
        return (
            <Skeleton height={size} />
        );
    }

    return (
        <Progress.Root size={size} >
            <Tooltip label={labels.filled?.tooltip} withArrow position="top" disabled={!labels.filled?.tooltip}>
                <Progress.Section classNames={{ section: styles.progressSection }} value={value} color={color}>
                    <Progress.Label classNames={{ label: styles.progressLabel }}>{labels.filled?.root}</Progress.Label>
                </Progress.Section>
            </Tooltip>
            <Tooltip label={labels.rest?.tooltip} withArrow position="top" disabled={!labels.rest?.tooltip}>
                <Progress.Section classNames={{ section: styles.progressSection }} value={100 - value} color={"transparent"}>
                    <Progress.Label classNames={{ label: styles.progressLabel }}>{labels.rest?.root}</Progress.Label>
                </Progress.Section>
            </Tooltip>
        </Progress.Root>
    );
}