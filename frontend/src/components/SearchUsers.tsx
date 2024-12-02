import { FiSearch } from "react-icons/fi";
import Input from "./Input";
import { useEffect, useState } from "react";
import InfiniteScrollObserver from "./InfiniteScrollObserver";
import { FriendsData } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import User from "./User";
import { twMerge } from "tailwind-merge";

interface UserSkeltonProps {
    className?: string
}

function UserSkelton({className}: UserSkeltonProps) {
    return (
        <div className={twMerge("flex items-center gap-4 cursor-pointer shrink overflow-hidden whitespace-nowrap", className)}>
            <div className="size-[38px] rounded-full overflow-hidden shrink-0 bg-border"/>
            <span className="rounded-full bg-border h-4 w-24" />
        </div>
    )
}

function Result({users, isLoading}: {users: FriendsData[], isLoading: boolean}) {
    const navigate = useNavigate();
    const { dispatch } = useGlobalContext();
    const [isFirstTime, setIsFirstTime] = useState(true);

    const clickHandler = (profile: string) => {
        dispatch({ type: STORE_OPTS.SEARCH });
        navigate(profile)
    }

    useEffect(() => {
        if (isLoading) {
            setIsFirstTime(false);
        }
    }, [isLoading])

    return (
        <div className="max-h-[168px] overflow-auto scrollClass">
            {
                !isFirstTime && !isLoading && users.length == 0 && <div className="text-center">No results found.</div>
            }
            {
                !isFirstTime && !isLoading && users.length !== 0 && users.map((elem: FriendsData, index: number) => {
                    return (
                        <div onClick={() => clickHandler(elem.profile)} key={index} className="flex justify-between items-center w-full gap-3 rounded-md hover:bg-gray3 p-2 cursor-pointer">
                            <div className="flex items-center gap-4 cursor-pointer shrink overflow-hidden whitespace-nowrap">
                                <User border url={elem.profile_image} />
                                <span className="shrink overflow-hidden text-ellipsis">{elem.username}</span>
                            </div>
                        </div>
                    )
                })
            }
            {
                isLoading && [1,2,3].map((elem) => {
                    return (
                        <UserSkelton 
                            key={elem} 
                            className="py-1 animate-pulse"
                        />
                    )
                })
            }
        </div>   
    );
}

function SearchUsers() {
    const [input, setInput] = useState<string>('');
    const [data, setData] = useState<FriendsData[]>([]);
    const [isFetched, setIsFetched] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const whenFetched = (result: FriendsData[]) => {
        setData(result);
        setIsLoading(false);
    }

    const whenError = (result: FriendsData[]) => {
        setData(result);
        setIsLoading(false);
    }

    const submitHandler = (e: any) => {
        setIsLoading(true);
        e.preventDefault();
        setIsFetched(false);
    }

    useEffect(() => {
        if (!isFetched) {
            setIsFetched(true)
        }
    }, [isFetched])

    return (
        <div className="bg-secondary rounded-md p-10 space-y-5">
            <form
                onSubmit={(e) => submitHandler(e)} 
                className='flex justify-between gap-3'>
                <Input onChange={(e) => {
                    setInput(e.target.value);
                }} 
                type='text' className="w-full border-border" placeholder="search for a user" />
                <button className="shrink-0 size-[48px] rounded-md border border-border flex justify-center items-center">
                    <FiSearch />
                </button>
            </form>
            {<Result users={data} isLoading={isLoading} />}
            {isFetched && <InfiniteScrollObserver
                endPoint={`search/?filter=${input}`}
                whenFetched={whenFetched}
                whenError={whenError}
                searchUsers={true} />}
        </div>
    );
}

export default SearchUsers;