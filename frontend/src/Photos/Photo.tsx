import "./Photo.scss";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IPhotoReqJSON } from "~../../src/entity/Photo";
import { LoadingStub } from "~LoadingStub";
import { getPhotoImgPath, getPhotoThumbPath } from "~redux/api/photos";
import { photoLoadStart } from "~redux/photos/actions";
import { IPhotoState } from "~redux/photos/reducer";
import { IAppState } from "~redux/reducers";

export interface IPhotoComponentProps {
    id: number;
    photo: IPhotoReqJSON | undefined;
    photoState: IPhotoState | undefined;

    fetchPhoto: (id: number) => void;
}

export const PhotoComponent: React.FunctionComponent<IPhotoComponentProps> = (
    props,
) => {
    if (!props.photo && !props.photoState?.fetching) {
        props.fetchPhoto(props.id);
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
                        src={getPhotoThumbPath(props.photo, 2048)}
                    />
                </div>
            ) : (
                <div>Photo not uploaded yet</div>
            )}
        </>
    );
};

function mapStateToProps(state: IAppState, props: IPhotoComponentProps) {
    const { id } = props;
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

// Because https://github.com/DefinitelyTyped/DefinitelyTyped/issues/16990
export const Photo = connect(
    mapStateToProps,
    mapDispatchToProps,
)(PhotoComponent) as any;
