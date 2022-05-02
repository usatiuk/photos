import * as React from "react";

import { shallow } from "enzyme";
import { IOverviewComponentProps, OverviewComponent } from "../Overview";

afterEach(() => {
    jest.restoreAllMocks();
});

const fetchPhotosFn = jest.fn();
const startDeletePhotosFn = jest.fn();
const cancelDeleteFn = jest.fn();

const overviewComponentDefaultProps: IOverviewComponentProps = {
    photos: [],
    allPhotosLoaded: false,
    triedLoading: false,
    overviewFetching: false,
    overviewFetchingError: null,
    overviewFetchingSpinner: false,
    darkMode: false,

    fetchPhotos: fetchPhotosFn,
    startDeletePhotos: startDeletePhotosFn,
    cancelDelete: cancelDeleteFn,
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
