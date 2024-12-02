import ChangePassword from "./ChangePassword";
import TFA from "./TFA";

function Security() {
	return (
		<div className="flex flex-col gap-5">
			<TFA />
			<ChangePassword />
		</div>
	);
}

export default Security;