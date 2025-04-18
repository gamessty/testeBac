import { SimpleGrid } from "@mantine/core";
import UserCard from "../Cards/UserCard/UserCard";
import { User } from "next-auth";

interface BaseUserCardListProps {
    skeleton?: boolean;
    users?: User[];
    numberOfCards?: number;
}

interface SkeletonUserCardListProps extends BaseUserCardListProps {
    skeleton: true;
    numberOfCards: number;
}

interface FetchedUserCardListProps extends BaseUserCardListProps {
    skeleton: false;
    users: User[];
    onUserClick?: (user: User) => void;
}

type UserCardListProps = SkeletonUserCardListProps | FetchedUserCardListProps;

export default function UserCardList(props: Readonly<UserCardListProps>) {
    if (props.skeleton) {
        return (
            <SimpleGrid cols={{ xs: 2, md: 3, lg: 4, xl: 6 }}>
                {Array.from({ length: props.numberOfCards }).map((_, index) => (
                    <UserCard key={"skeleton_Card" + index} h={"100%"} />
                ))}
            </SimpleGrid>
        );
    }

    const { users, onUserClick } = props;

    return (
        <SimpleGrid cols={{ xs: 2, md: 3, lg: 4, xl: 6 }}>
            {users.map((user) => (
                <UserCard
                    onClick={() => {
                        if (onUserClick) onUserClick(user);
                    }}
                    key={user.id}
                    user={user}
                    h={"100%"}
                />
            ))}
        </SimpleGrid>
    );
}