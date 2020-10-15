import "./Overview.scss";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IAppState } from "~redux/reducers";
import { photosLoadStart } from "~redux/photos/actions";
import { IPhotoReqJSON } from "~../../src/entity/Photo";
import { LoadingStub } from "~LoadingStub";
import { PhotoCard } from "./PhotoCard";
import { Button } from "@blueprintjs/core";
import { UploadButton } from "./UploadButton";

export interface IOverviewComponentProps {
    photos: IPhotoReqJSON[] | null;
    overviewLoaded: boolean;
    overviewFetching: boolean;
    overviewFetchingError: string | null;
    overviewFetchingSpinner: boolean;

    fetchPhotos: () => void;
}

export const OverviewComponent: React.FunctionComponent<IOverviewComponentProps> = (
    props,
) => {
    if (!props.overviewLoaded && !props.overviewFetching) {
        props.fetchPhotos();
    }
    if (!props.photos) {
        return <LoadingStub spinner={props.overviewFetchingSpinner} />;
    }

    const photos = props.photos
        .sort((a, b) => b.shotAt - a.shotAt)
        .map((photo) => <PhotoCard key={photo.id} photo={photo} />);

    return (
        <div id="overview">
            <div id="actionbar">
                <UploadButton />
            </div>
            <div className="list">{photos}</div>
        </div>
    );
};

function mapStateToProps(state: IAppState) {
    return {
        photos: state.photos.photos,
        overviewLoaded: state.photos.overviewLoaded,
        overviewFetching: state.photos.overviewFetching,
        overviewFetchingError: state.photos.overviewFetchingError,
        overviewFetchingSpinner: state.photos.overviewFetchingSpinner,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return { fetchPhotos: () => dispatch(photosLoadStart()) };
}

export const Overview = connect(
    mapStateToProps,
    mapDispatchToProps,
)(OverviewComponent);
