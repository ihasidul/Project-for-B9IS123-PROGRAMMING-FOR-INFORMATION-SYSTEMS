
from fastapi.responses import JSONResponse

class CustomJSONResponse(JSONResponse):
    """
    Extending the JSONResponse class to provide a custom response format.
    To unify the response structure across the application.
    """
    def __init__(self, content: dict, message:str, status_code: int = 200, headers: dict = None):
        self.message = message
        super().__init__(content=content, status_code=status_code, headers=headers)
        self.headers["Content-Type"] = "application/json"
        
    def render(self, content: dict) -> bytes:
        is_success = 200 <= self.status_code < 300
        custom_content = {
            "success": is_success,
            "message": self.message or (is_success and 'Request Success') or 'Request Failed',
        }
        if is_success:
            content = {
                "data": content
            }
        
        if isinstance(content, dict) and 'data' in content.keys():
            custom_content.update(**content)
        else:
            custom_content['data'] = content
        if isinstance(custom_content.get('data'), dict) and custom_content.get('data', {}).get('message'):
            custom_content['message'] = custom_content['data']['message']
        return super().render(custom_content)
    