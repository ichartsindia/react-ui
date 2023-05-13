import axios from 'axios'

export default class OptionService {

    getOptions() {
        return axios.get('http://localhost:3001/strategy/sample.json')
            .then(res => res.data);
    }
}