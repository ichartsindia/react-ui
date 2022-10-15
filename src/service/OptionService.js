import axios from 'axios'

export default class OptionService {

    getOptions() {
        return axios.get('assets/data/oct06.json')
            .then(res => res.data.data);
    }
}