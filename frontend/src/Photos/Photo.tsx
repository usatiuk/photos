import "./Photo.scss";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import { Dispatch } from "redux";
import { IPhotoReqJSON } from "~../../src/entity/Photo";
import { LoadingStub } from "~LoadingStub";
import { getPhotoImgPath } from "~redux/api/photos";
import { photoLoadStart } from "~redux/photos/actions";
import { IPhotoState } from "~redux/photos/reducer";
import { IAppState } from "~redux/reducers";

export interface IPhotoComponentProps extends RouteComponentProps {
    photo: IPhotoReqJSON | undefined;
    photoState: IPhotoState | undefined;

    fetchPhoto: (id: number) => void;
}

function getId(props: RouteComponentProps) {
    return parseInt((props.match?.params as { id: string }).id);
}

export const PhotoComponent: React.FunctionComponent<IPhotoComponentProps> = (
    props,
) => {
    const id = getId(props);

    if (!props.photo && !props.photoState?.fetching) {
        console.log(props);
        props.fetchPhoto(id);
    }
    if (!props.photo) {
        return <LoadingStub spinner={false} />;
    }

    const fileExists = props.photo.uploaded;

    return (
        <>
            {fileExists ? (
                <div id="photoView">
                    <img
                        id="photo"
                        loading="lazy"
                        src={getPhotoImgPath(props.photo)}
                    />
                </div>
            ) : (
                <div>Photo not uploaded yet</div>
            )}
        </>
    );
};

function mapStateToProps(state: IAppState, props: RouteComponentProps) {
    const id = getId(props);
    let photo = undefined;
    let photoState = undefined;

    if (state.photos.photos) {
        photo = state.photos.photos.find((p) => p.id === id);
    }
    if (state.photos.photoStates[id]) {
        photoState = state.photos.photoStates[id];
    }
    return {
        photo,
        photoState,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return { fetchPhoto: (id: number) => dispatch(photoLoadStart(id)) };
}

export const Photo = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(PhotoComponent),
);
