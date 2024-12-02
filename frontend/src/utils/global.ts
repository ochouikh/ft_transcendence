export const getDate = () => {
	const date = new Date();

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0')

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

class MessageDate {

	constructor() {}

	getDate() {
		const date = new Date();
	
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0')
	
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}
	
	getDay(inDate: string) {
		const parts = inDate.split(' ');

		const date = new Date();
	
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
	
		if (parts[0] == `${year}-${month}-${day}`) {
			return 'today'
		}
		return parts[0];
	}
}

export const dateMeta = new MessageDate();
 