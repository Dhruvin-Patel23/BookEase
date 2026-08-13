# Bookease

A modern full-stack appointment booking platform connecting customers with verified service providers through real-time scheduling, secure authentication, and role-based dashboards.


## Cloudinary profile pictures

The provider profile now supports profile picture uploads through Cloudinary.

1. Create a Cloudinary account and get your Cloud Name, API Key, and API Secret.
2. Add these variables to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. From `backend`, run `npm install` to install the `cloudinary` package.
4. Start the backend and frontend normally.

On the Provider Profile page, click the pencil button on the profile picture to open the Edit Profile modal. The selected image is uploaded to Cloudinary and the returned secure URL is saved to the provider's `profileImage` field.
