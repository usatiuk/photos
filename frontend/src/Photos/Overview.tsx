import "./Overview.scss";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IAppState } from "~redux/reducers";
import { photosLoadStart } from "~redux/photos/actions";
import { IPhotoReqJSON } from "~../../src/entity/Photo";
import { LoadingStub } from "~LoadingStub";
import { PhotoCard } from "./PhotoCard";
import { Button, Classes, Overlay } from "@blueprintjs/core";
import { UploadButton } from "./UploadButton";
import { Photo } from "./Photo";

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
    const [selectedPhoto, setSelectedPhoto] = React.useState<number>(0);
    const [isOverlayOpened, setOverlayOpen] = React.useState<boolean>(false);

    if (!props.overviewLoaded && !props.overviewFetching) {
        props.fetchPhotos();
    }
    if (!props.photos) {
        return <LoadingStub spinner={props.overviewFetchingSpinner} />;
    }

    const onCardClick = (id: number) => {
        setSelectedPhoto(id);
        setOverlayOpen(true);
    };

    const photos = props.photos
        .sort((a, b) => b.shotAt - a.shotAt)
        .map((photo) => (
            <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={() => onCardClick(photo.id)}
            />
        ));

    return (
        <>
            <Overlay
                autoFocus
                enforceFocus
                usePortal
                isOpen={isOverlayOpened}
                onClose={() => {
                    setOverlayOpen(false);
                }}
                lazy
            >
                <div id="photoOverlayContainer">
                    <Photo id={selectedPhoto} />
                </div>
            </Overlay>
            <div id="overview">
                <div id="actionbar">
                    <UploadButton />
                </div>
                <div className="list">{photos}</div>
            </div>
        </>
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
