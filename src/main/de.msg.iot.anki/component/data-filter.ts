interface DataFilter<I, O> {

    filter(data : I) : O;

}

export {DataFilter}