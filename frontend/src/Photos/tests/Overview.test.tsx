import * as React from "react";

import { shallow } from "enzyme";
import { IOverviewComponentProps, OverviewComponent } from "../Overview";

afterEach(() => {
    jest.restoreAllMocks();
});

const fetchPhotosFn = jest.fn();

const overviewComponentDefaultProps: IOverviewComponentProps = {
    photos: null,
    overviewLoaded: false,
    overviewFetching: false,
    overviewFetchingError: null,
    overviewFetchingSpinner: false,

    fetchPhotos: fetchPhotosFn,
};

describe("<Overview />", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should not crash and call fetchPhotos", () => {
        const wrapper = shallow(
            <OverviewComponent {...overviewComponentDefaultProps} />,
        );
        expect(fetchPhotosFn).toHaveBeenCalled();
    });
});
