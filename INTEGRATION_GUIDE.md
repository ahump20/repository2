# Example Integration: Sportsdata.io API

The [Sportsdata.io](https://sportsdata.io/) service offers comprehensive sports statistics for several leagues. Below is a short walkthrough of how you can start using their football data API.

## 1. Sign up and obtain an API key
1. Visit the [Sportsdata.io registration page](https://sportsdata.io/developers/register).
2. Create an account or log in. After registration, navigate to your profile dashboard.
3. Choose the desired sport and subscription plan. The dashboard will display your **API key**, which is required for all requests.

## 2. Example request
Sportsdata.io uses standard RESTful endpoints. Here's a sample request to fetch NFL players using `curl`:
```bash
curl -G "https://api.sportsdata.io/v3/nfl/scores/json/Players" \
  -d "key=YOUR_API_KEY"
```
Replace `YOUR_API_KEY` with the key from your dashboard. The response will be a JSON array containing player information.

## 3. Notes
- **Rate limits** and allowed endpoints depend on your subscription plan. Review the [Sportsdata.io documentation](https://sportsdata.io/developers) for details.
- Additional parameters can filter the results (e.g., by season or team). Refer to the docs for the specific endpoint.
