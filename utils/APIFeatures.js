class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString
    }

    filter() {
        // 1A) FILTERING
        const queryObj = { ...this.queryString };
        const excludedFields = ['sort', 'fields', 'page', 'limit'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B) ADVANCE FILTERING
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|lt|gte|lte)\b/, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;

    }

    sort() {
        // 2) SORTING
        if (this.queryString.sort) {
            let sortBy = this.queryString.sort.split(',').join('');
            this.query = this.query.sort(sortBy);
        }
        return this;
    }

    limit() {
        // 3) LIMITING
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }


    paginate() {
        // PAGINATION
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        console.log('skip')

        this.query = this.query.skip(skip);
        this.query = this.query.limit(limit)
        return this;
    }

}

module.exports = APIfeatures;