import "./Photos.scss";
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
    fetching: boolean;
    fetchingError: string | null;
    fetchingSpinner: boolean;

    fetchPhotos: () => void;
}

export const OverviewComponent: React.FunctionComponent<IOverviewComponentProps> = (
    props,
) => {
    if (!props.photos && !props.fetching) {
        props.fetchPhotos();
    }
    if (!props.photos) {
        return <LoadingStub spinner={props.fetchingSpinner} />;
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
        fetching: state.photos.fetching,
        fetchingError: state.photos.fetchingError,
        fetchingSpinner: state.photos.fetchingSpinner,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return { fetchPhotos: () => dispatch(photosLoadStart()) };
}

export const Overview = connect(
    mapStateToProps,
    mapDispatchToProps,
)(OverviewComponent);
