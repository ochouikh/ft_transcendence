import { Outlet } from "react-router-dom";
import PingPongContextProvider from "@/contexts/pingPongProvider";

function GameLayout() {
	return (
				<PingPongContextProvider>
					<Outlet />
				</PingPongContextProvider>
	);
}

export default GameLayout;